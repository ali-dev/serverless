'use strict';

const stripe = require('stripe')('sk_test_9O0fNrOk3IZwt05uCZMAkgRd00ZiywEHGO'); 
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const AWS_DEPLOY_REGION = 'us-east-1';


module.exports.createCharge = async (event, context, callback) => {	
	const data = event;
	
	const documentClient = new AWS.DynamoDB.DocumentClient(
		{
			api_version: '2012-08-10',
			region: AWS_DEPLOY_REGION
		}
	);
	console.log(`eventId is ${data.arguments.eventId}`);
	const eventFetchParams = {
		Key: {
		 "id": data.arguments.eventId
		}, 
		TableName: 'dev-event'
	};
	
	

	try {
		
		const eventObject = await documentClient.get(eventFetchParams).promise();
		const event = eventObject.Item; 
		const guests = event.guests;
		const guestId = data.arguments.guestId;
		
		if (guests[guestId]) {
			const params = {
				TableName: 'dev-event',
				Key: { "id": data.arguments.eventId },
				UpdateExpression: 'SET guests.#guest_id = :guestDetails ADD version :one',
				ExpressionAttributeNames: {'#guest_id' : guestId},
				ExpressionAttributeValues: {
				  ':guestDetails' : JSON.parse(data.arguments.guest),
				  ':one' : 1,
				}
			  };
			await documentClient.update(params).promise();
			// @todo send email notification to eventHost 
			// @todo send confirmation to guest  
		} else {
			return {
				statusCode: 400,
				error: `Could not RSVP to event ${event.eventName}`,
				body: JSON.stringify({success:'false'})
			}
		}
	} catch(error) {
		console.log(`ERROR: ${error}`);
		return {
			statusCode: 400,
			error: 'Could not retrieve event',
			body: JSON.stringify({success:'false'})
		}
	}
	
    console.log(data.arguments.token);
	(async () => {
	  const session = await stripe.checkout.sessions.create({
	    payment_method_types: ['card'],
	    line_items: [{
	      name: 'T-shirt',
	      description: 'Comfortable cotton t-shirt',
	      images: ['https://example.com/t-shirt.png'],
	      amount: 500,
	      currency: 'usd',
	      quantity: 1,
	    }],
	    success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
	    cancel_url: 'https://example.com/cancel',
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
