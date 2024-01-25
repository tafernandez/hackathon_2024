const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function pause(milliseconds) {
	var dt = new Date();
	while ((new Date()) - dt <= milliseconds) { /* Do nothing */ }
}

function callHostToConfirm({callSid, phone_number}) {
    console.log("callHostToConfirm", callSid, phone_number);

    client.calls.create({
      method: "POST",
      url: `https://${process.env.SERVER}/incoming?memSid=${callSid}`,
      to: process.env.TO_NUMBER,
      from: process.env.FROM_NUMBER
    })
   .then(call=>call)

   pause(3000);

   return "true"
}

module.exports = callHostToConfirm;