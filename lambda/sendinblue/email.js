"use strict";

const postmark = require("postmark")

// @todo figure out why this cannot be called
const invitationValidation = function(data) {
  let validation = {
    isValid: true,
    message: null
  }
  
  // @todo maybe figure out a smarter way to validate
  if (!data.eventDate) {
    validation.isValid = false;
    validation.message = 'Event Date is not specified';
  }
  if (!data.hostName) {  
    validation.message = 'Host Name is not specified';
  }
  if (!data.eventId) {  
    validation.message = 'EventId is not specified';
  }

  if (!data.eventName) {  
    validation.message = 'EventName is not specified';
  }

  if (validation.message !== null) {
    validation.isValid = false;
  }
  return validation;
}
const sendInvitation = (event, context, callback) => {
  const data = JSON.parse(event.arguments.data);


  const serverToken = process.env.POSTMAN_SERVER_TOKEN; //"xxxx-xxxxx-xxxx-xxxxx-xxxxxx";
  const client = new postmark.ServerClient(serverToken);
  
  // let errorMessage = null;
  // const invitationValidation = invitationValidation(data);
  const validation = invitationValidation(data);
  if (validation.isValid === false) {
    return callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify({ success: "false", "message":  validation.message})
    });
    
  }

  
  (async () => {
    if (!data.eventDate) {
      throw 'Event Date should be specified';
    } 
    // trigger email here
    client.sendEmailWithTemplate({
      "From": "ali@causeandcuisine.com", //@todo determine if it is best practice to add the sender's email 
      "To": "ali@causeandcuisine.com", //@todo: change to data.guestEmail, after we start paying - `While your account is pending approval, all recipient addresses must share the same domain as the 'From' address.`
      "TemplateId": process.env.TEMPLATE_ID_SEND_INVITATION,
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
