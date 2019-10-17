'use strict';


module.exports.createCharge = (event, context, callback) => {
  return callback(null, {
                statusCode: 200,
                headers: {
                  "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                  "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
                },
                body: JSON.stringify({success:'true'})
            });

};
