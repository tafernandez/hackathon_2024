require("dotenv").config();
const express = require("express");
const ExpressWs = require("express-ws");
const colors = require('colors');

const { GptService } = require("./services/gpt-service");
const { StreamService } = require("./services/stream-service");
const { TranscriptionService } = require("./services/transcription-service");
const { TextToSpeechService } = require("./services/tts-service");

const findProfile = require("./functions/findProfile");
const contextMemory = {}

const app = express();
ExpressWs(app);

const PORT = process.env.PORT || 3000;

app.post("/incoming", (req, res) => {
  res.status(200);
  res.type("text/xml");
  res.end(`
  <Response>
    <Connect>
      <Stream url="wss://${process.env.SERVER}/connection">
        <Parameter name="id" value="${process.env.TO_NUMBER}" />
        <Parameter name="memSid" value="${req.query.memSid}" /> 
      </Stream>
    </Connect>
  </Response>
  `);
});

app.ws("/connection", (ws, req) => {
  // Filled in from start message
  let streamSid, memSid, profile, name; 

  ws.on("error", function(err) {
    console.log(err);
    if(memSid) contextMemory[memSid] = gptService.userContext;
  });

  const gptService = new GptService();
  const streamService = new StreamService(ws);
  const transcriptionService = new TranscriptionService();
  const ttsService = new TextToSpeechService({});
  
  let marks = []
  let interactionCount = 0

  // Incoming from MediaStream
  ws.on("message", async function message(data) {
    const msg = JSON.parse(data);
    if(msg.event === "start") {
      console.log(msg.start)
      memSid = msg.start.customParameters.memSid === 'undefined' ? msg.start.callSid : msg.start.customParameters.memSid;
      if(msg.start.customParameters.memSid !== 'undefined') {
        console.log(contextMemory);
        gptService.userContext = contextMemory[memSid] || []
        gptService.userContext.push(
          { "role": "system",
            "content": `
              You are now switching to talking to the host to get their side of the information.
              Give them the context of what you've learned and what you're calling about.
              What information do you need from the host at this point? Ask the questions you need to ask.
               When you are done with the host, hang up and compile a summary of the call to be passed into the createFlexTask function
            `
          },
          { "role": "assistant",
            "content": "Hi, I am calling from AirBNB about a complaint from one of your guests."
          }
        );
        process.env.WELCOME_MESSAGE = "Hi, I am calling from AirBNB about a complaint from one of your guests."
        name = "host"
      }
      else {
        profile = await findProfile(msg.start.customParameters.id);
        profile.userId = process.env.TO_NUMBER;
        profile.callSid = msg.start.callSid
        gptService.userContext.push({
          role: "function",
          name: "findProfile",
          content: JSON.stringify(profile)
        });
        name = "guest"
      }
      streamSid = msg.start.streamSid;
      streamService.setStreamSid(streamSid);
      console.log(`Twilio -> Starting Media Stream for ${streamSid}`.underline.red);
      ttsService.generate({partialResponseIndex: null, partialResponse: process.env.WELCOME_MESSAGE }, 1);
    } else if (msg.event === "media") {
      transcriptionService.send(msg.media.payload);
    } else if (msg.event === "mark") {
      const label = msg.mark.name;
      console.log(`Twilio -> Audio completed mark (${msg.sequenceNumber}): ${label}`.red)
      marks = marks.filter(m => m !== msg.mark.name)
    } else if (msg.event === "stop") {
      console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red)
    }
  });

  ws.on("close", function() {
    contextMemory[memSid] = gptService.userContext;
  });

  transcriptionService.on("utterance", async (text) => {
    // This is a bit of a hack to filter out empty utterances
    if(marks.length > 0 && text?.length > 5) {
      console.log("Twilio -> Interruption, Clearing stream".red)
      ws.send(
        JSON.stringify({
          streamSid,
          event: "clear",
        })
      );
    }
  });

  transcriptionService.on("transcription", async (text) => {
    if (!text) { return; }
    console.log(`Interaction ${interactionCount} – STT -> GPT: ${text}`.yellow);
    gptService.completion(text, interactionCount, 'user', name);
    interactionCount += 1;
    contextMemory[memSid] = gptService.userContext;
  });
  
  gptService.on('gptreply', async (gptReply, icount) => {
    console.log(`Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green )
    ttsService.generate(gptReply, icount);
  });

  ttsService.on("speech", (responseIndex, audio, label, icount) => {
    console.log(`Interaction ${icount}: TTS -> TWILIO: ${label}`.blue);

    streamService.buffer(responseIndex, audio);
  });

  streamService.on('audiosent', (markLabel) => {
    marks.push(markLabel);
  })
});

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
