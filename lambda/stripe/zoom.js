'use strict';
const jwt = require("jsonwebtoken");
const rp = require("request-promise");
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const AWS_DEPLOY_REGION = 'us-east-1';
const uuid = require('uuid');


const getErrorResponse = (message) => {
	return {
		statusCode: code,
		headers: {
		"Access-Control-Allow-Origin" : "*", // Required for CORS support to work
		"Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
		},
		error: `${message}`,
		body: JSON.stringify({success:'false'})
	}
}


module.exports.createVirtualEvent = (event, context, callback) => {	
	const data = event;
	
	const {date, time } = data.arguments;
	
	const dateTime = `${date} ${time}`;


	const payload = {
		iss: 'aFBIso59TRSQcL12_6qgtQ',
		exp: ((new Date()).getTime() + 5000)
	};

	const token = jwt.sign(payload, process.env.ZOOM_ACCESS_TOKEN);

	const documentClient = new AWS.DynamoDB.DocumentClient(
		{
			api_version: '2012-08-10',
			region: AWS_DEPLOY_REGION
		}
	);

	


	let options = {
		uri: `https://api.zoom.us/v2/users/${process.env.ZOOM_USER_ID}/meetings`,
		// uri: 'https://api.zoom.us/v2/users',
		qs: {
			status: "active", // -> uri + '?status=active'
		},
		body: {
			topic: "party",
			type: 2,
			start_time: "2020-05-05 00:00:00",
			duration: 120,
			timezone: "UTC",
			password: "string",
			agenda: "string",
			settings: {
			host_video: true,
			participant_video: true,
			cn_meeting: false,
			in_meeting: false,
			join_before_host: true,
			mute_upon_entry: false,
			watermark: false,
			use_pmi: false,
			approval_type: 0,
			registration_type: 1,
			audio: "both",
			auto_recording: "none",
			enforce_login: false,

			registrants_email_notification: false,
			},
		},
		auth: {
			bearer: token
		},
		method: "POST",
		headers: {
			"User-Agent": "Zoom-Jwt-Request",
			"content-type": "application/json",
		},
		json: true, // Automatically parses the JSON string in the response
		};


	try {
		
		
		console.log("test");
		
		rp(options)
		.then(function (response) {
			//logic for your response
			// console.log("User has", response);
			let dynamoData = {...data.arguments};
			
			dynamoData.userId = data.identity;
			dynamoData.id = uuid.v4(); 
			dynamoData.zoomLink = response.join_url; 
			
			const eventCreateParams = {
				Item: dynamoData, 
				TableName: 'dev-event'
			};
			// console.log(eventCreateParams);
			
			documentClient.put(eventCreateParams, function(error, data) {
				if (error) {
					return getErrorResponse(error.message);
				}

				return {
					statusCode: 200,
					headers: {
					"Access-Control-Allow-Origin" : "*", // Required for CORS support to work
					"Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
					},
					body: JSON.stringify(data)
				}
			});

			

		})
		.catch(function (err) {
			// API call failed...
			console.log("Zoom API call failed, reason ", err.message);
			console.log(`ERROR: ${err}`);
			return getErrorResponse(`Could not create zoom event ${err.message}`);
		});


	} catch(error) {
		return getErrorResponse(`Could not create event ${err.message}`);
	}
};
