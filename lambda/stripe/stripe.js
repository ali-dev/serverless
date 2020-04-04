'use strict';

const stripe = require('stripe')('sk_test_9O0fNrOk3IZwt05uCZMAkgRd00ZiywEHGO'); 
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const AWS_DEPLOY_REGION = 'us-east-1';


module.exports.createCharge = async (event, context, callback) => {	
	const data = event;
	

	const {guest, guestId, eventId, amount, willDonate } = data.arguments;
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
		
		if (guests[guestId]) {
			const params = {
				TableName: 'dev-event',
				Key: { "id": eventId },
				UpdateExpression: 'SET guests.#guest_id = :guestDetails ADD version :one',
				ExpressionAttributeNames: {'#guest_id' : guestId},
				ExpressionAttributeValues: {
				  ':guestDetails' : JSON.parse(guest),
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
	
	const response = {
		statusCode: 200,
		headers: {
		"Access-Control-Allow-Origin" : "*", // Required for CORS support to work
		"Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
		},
		body: JSON.stringify({success:'true'})
	}
	if (willDonate) {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount*100, // in cents
			currency: 'usd',
			// Verify your integration in this guide by including this parameter
			payment_method_types: ['card'],
			metadata: {
				eventId: event.id,
				causeId: event.causeId,
				guestId: guestId
			},
		});
		response.body = JSON.stringify({success:'true', paymentIntent: paymentIntent});
	} 

	return response;

};
