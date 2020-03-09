"use strict";

const postmark = require("postmark")

const sendInvitation = (event, context, callback) => {
  let data = event.body;
  if (typeof event.body == "string") {
    console.log(data);
    data = JSON.parse(data);
  } else {
    data = event.body;
  }


  const serverToken = process.env.POSTMAN_SERVER_TOKEN; //"xxxx-xxxxx-xxxx-xxxxx-xxxxxx";
  const client = new postmark.ServerClient(serverToken);

  
  
  console.log(data["hostName"]);
  
  (async () => {
    // trigger email here
    client.sendEmail({
      "From": "ali@causeandcuisine.com", //@todo determine if it is best practice to add the sender's email 
      "To": data.guestEmail,
      "Subject": "Test",
      "TextBody": "Hello from Postmark!",
      "TemplateId": "16783368",
      "TemplateModel": {
        "name": data.guestName,
        "event_name": data.eventName,
        "host_name": data.hostName,
        "cause_and_cuisine_url": "https://staging.causeandcuisine.com", // @todo use env. variable to determine domain
        "event_url": `https://staging.causeandcuisine.com/rsvp/${data.eventId}/${data.guestId}`
      }
    }).then(response => {
      console.log("API called successfully. Returned data: " + JSON.stringify(response));
    }).error(err => {
      console.error(error);
    });
    
  })();
  return callback(null, {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify({ success: "true" })
  });
};

module.exports = {
  sendInvitation
};
