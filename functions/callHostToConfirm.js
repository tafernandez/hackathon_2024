const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function pause(milliseconds) {
	var dt = new Date();
	while ((new Date()) - dt <= milliseconds) { /* Do nothing */ }
}

function callHostToConfirm({callSid, phone_number}) {
    console.log("callHostToConfirm", callSid, phone_number);

    client.calls(callSid).update({
        twiml: "<Response><Say>We have recorded your complaint and will follow up with you shortly.</Say></Response>"
    }).then(call=>{
      client.calls.list({to: phone_number, limit: 20})
        .then(calls=>{
          for(const call of calls)
            if(call.status === "ringing" || call.status === "in-progress") return;

          pause(1000);
          client.calls.create({
            method: "POST",
            url: `https://${process.env.SERVER}/incoming?memSid=${callSid}`,
            to: phone_number,
            from: process.env.FROM_NUMBER
          })
          .then(call=>call)
        });
    });

   pause(4000);

   return "true"
}

module.exports = callHostToConfirm;