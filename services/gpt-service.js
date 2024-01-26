const EventEmitter = require("events");
const colors = require('colors');
const OpenAI = require('openai');
const tools = require('../functions/function-manifest');

// Import all functions included in function manifest
// Note: the function name and file name must be the same
const availableFunctions = {}
tools.forEach((tool) => {
  functionName = tool.function.name;
  availableFunctions[functionName] = require(`../functions/${functionName}`);
});

class GptService extends EventEmitter {
  constructor() {
    super();
    this.calledHost = false; //added for new proj
    this.openai = new OpenAI();
    this.userContext = [
      { "role": "system",
        "content": `
          You are a customer service representative at AirBNB. 
          You have a customer reaching about about an inquiry.
          If you know anything about the customer, greet them like you know them.
          Your job is to try to help the customer as best as you can, but
            only if the customer is in the right. If the customer just did
            not pay attention, there's nothing you can do about it.
          If the customer is reaching out about a problem with a listing,
            figure out what the issue is, ask the customer how you can be of help,
            if absolutely necessary, figure out if the customer has the right 
            to a refund based on information about the listing and 
            any correspondence between the customer and the listing host.
          If you determine the customer is in the wrong, politely let them know
            that there's nothing you can do to help them in this situation.
          Don't assume anything, always confirm before moving forward with your path.
          If you need to gather more information on the other side of the story from 
            the host, you can initiate a call to the host and collect data from them
            before making a determination as well. Don't call the host until you have
            all the relevant details from the guest. If the guest says they had a 
            conversation with the host, ask what they had discussed and agreed upon
            before calling the host to confirm if the guest has told the truth
          Before calling the host, make sure you let the guest know that's what you're
            going to do and that you will get back to the guest once you have gathered
            more information.
            Once you have finished talking to both the host and the guest, compile a JSON object 
            with the following fields: airbnb_booking, host_transcription, guest_transcription, summary 
            and final_conclusion, that will be passed into the function called createFlexTask.
          Always stay on topic, only keep the conversation within the scope of the users's
            recent stays or a topic related to their experience with AirBNB. Don't discuss
            anything that's not within this scope.
          Always be polite, do not be rude or impatient.
          Keep your answers relatively short.
          Don't hangup in the end, ask the customer if you can help with anything else.
        `
      },
      { "role": "assistant", "content": process.env.WELCOME_MESSAGE },
    ],
    this.partialResponseIndex = 0
  }

  async completion(text, interactionCount, role = "user", name = "user") {
    console.log(this.userContext[this.userContext.length-1])
    if (name != "user" && name != "guest" && name != "host") {
      this.userContext.push({ "role": role, "name": name, "content": text })
    } else {
      this.userContext.push({ "role": role, "content": text })
    }

    // Step 1: Send user transcription to Chat GPT
    const stream = await this.openai.chat.completions.create({
      // model: "gpt-4-1106-preview",
      model: "gpt-4",
      messages: this.userContext,
      tools: tools,
      stream: true,
    });

    let completeResponse = ""
    let partialResponse = ""
    let functionName = ""
    let functionArgs = ""
    let finishReason = ""

    for await (const chunk of stream) {
      let content = chunk.choices[0]?.delta?.content || ""
      let deltas = chunk.choices[0].delta

      // Step 2: check if GPT wanted to call a function
      if (deltas.tool_calls) {

        // Step 3: call the function
        let name = deltas.tool_calls[0]?.function?.name || "";
        if (name != "") {
          functionName = name;
        }
        let args = deltas.tool_calls[0]?.function?.arguments || "";
        if (args != "") {
          // args are streamed as JSON string so we need to concatenate all chunks
          functionArgs += args;
        }
      }
      // check to see if it is finished
      finishReason = chunk.choices[0].finish_reason;

      // need to call function on behalf of Chat GPT with the arguments it parsed from the conversation
      if (finishReason === "tool_calls") {
        // parse JSON string of args into JSON object
        try {
          functionArgs = JSON.parse(functionArgs)
        } catch (error) {
          // was seeing an error where sometimes we have two sets of args
          if (functionArgs.indexOf('{') != functionArgs.lastIndexOf('{'))
            functionArgs = JSON.parse(functionArgs.substring(functionArgs.indexOf(''), functionArgs.indexOf('}') + 1));
        }

        const functionToCall = availableFunctions[functionName];
        if(functionToCall === "callHostToConfirm") {
          for(const context of this.userContext) {
            if(context.name === "callHostToConfirm") return
          }
        }

        // if(functionToCall === "createFlexTask") {
        //   for(const context of this.userContext) {
        //     console.log("looking at what context is for createFlexTask in gpt service: " + context)
        //     if(context.name === "createFlexTask") return
        //   }
        // }

        let functionResponse = functionToCall(functionArgs);

        // Step 4: send the info on the function call and function response to GPT
        this.userContext.push({
          role: 'function',
          name: functionName,
          content: functionResponse,
        });
        // extend conversation with function response

        // call the completion function again but pass in the function response to have OpenAI generate a new assistant response
        await this.completion(functionResponse, interactionCount, 'function', functionName);
      } else {
        // We use completeResponse for userContext
        completeResponse += content;
        // We use partialResponse to provide a chunk for TTS
        partialResponse += content;
        // Emit last partial response and add complete response to userContext
        if (content.trim().slice(-1) === "•" || finishReason === "stop") {
          const gptReply = { 
            partialResponseIndex: this.partialResponseIndex,
            partialResponse
          }

          this.emit("gptreply", gptReply, interactionCount);
          this.partialResponseIndex++;
          partialResponse = ""
        }
      }
    }
    this.userContext.push({"role": "assistant", "content": completeResponse})
    console.log(`GPT -> user context length: ${this.userContext.length}`.green)
  }
}

module.exports = { GptService }