"use strict";

// @todo: move this to email
const sendEventCreatedEmail = (event, context, callback) => {
  let data = event.body;
  if (typeof event.body == "string") {
    console.log(data);
    data = JSON.parse(data);
  } else {
    data = event.body;
  }

  

  (async () => {
    console.log("implemet email call here")
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
  sendEventCreatedEmail
  
};
