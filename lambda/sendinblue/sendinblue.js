'use strict';

var SibApiV3Sdk = require('sib-api-v3-sdk');

module.exports.sendEventCreatedEmail = (event, context, callback) => {
    
    let data = event.body;
    if (typeof event.body == 'string') {
      console.log(data);
      data = JSON.parse(data);
    } else {
      data = event.body;
    }
    
    // let data = {};
    console.log(data['hostName']);
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
 
    // Configure API key authorization: api-key
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.API_KEY;
    // Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
    //apiKey.apiKeyPrefix['api-key'] = "Token"
    
    // Configure API key authorization: partner-key
    const partnerKey = defaultClient.authentications['partner-key'];
    partnerKey.apiKey = process.env.API_KEY;
    
    
    const apiInstance = new SibApiV3Sdk.SMTPApi
    const to = [{'email': data.hostEmail, 'name': data.hostName}];
    var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); 
    sendSmtpEmail.templateId = 3;
    sendSmtpEmail.to = to; 
    data.hostEmail;
    sendSmtpEmail.params = {
        'hostName': data.hostName,
        'causeName': data.causeName,
        'editId': data.editId
    },
    sendSmtpEmail.tags = Array['eventCreated', 'events'];


    
	(async () => {
      // trigger email here
      apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
        console.log('API called successfully. Returned data: ' + data);
      }, function(error) {
        console.error(error);
      });
	})();
  	return callback(null, {
	        statusCode: 200,
	        headers: {
	          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
	          "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
	        },
	        body: JSON.stringify({success:'true'})
        });

};
