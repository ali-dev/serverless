"use strict";

const postmark = require("postmark")

const sendInvitation = (event, context, callback) => {
  console.log(`EVENT IS: ${JSON.stringify(event)}`);
  const data = JSON.parse(event.arguments.data);


  const serverToken = process.env.POSTMAN_SERVER_TOKEN; //"xxxx-xxxxx-xxxx-xxxxx-xxxxxx";
  const client = new postmark.ServerClient(serverToken);
  
  console.log(data);
  console.log(`TOKEN: ${serverToken}`);
  
  (async () => {
    // trigger email here
    client.sendEmailWithTemplate({
      "From": "ali@causeandcuisine.com", //@todo determine if it is best practice to add the sender's email 
      "To": "ali@causeandcuisine.com", //@todo: change to data.guestEmail, after we start paying - `While your account is pending approval, all recipient addresses must share the same domain as the 'From' address.`
      "TemplateId": "16783368",
      "TemplateModel": {
        "name": data.guestName,
        "event_name": data.eventName,
        "host_name": data.hostName,
        "cause_and_cuisine_url": "https://staging.causeandcuisine.com", // @todo use env. variable to determine domain
        "event_url": `https://staging.causeandcuisine.com/rsvp/${data.eventId}/${data.guestId}`
      }
    })
    
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
