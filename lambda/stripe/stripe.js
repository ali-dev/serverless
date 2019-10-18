'use strict';

const stripe = require('stripe')('sk_test_9O0fNrOk3IZwt05uCZMAkgRd00ZiywEHGO'); 

module.exports.createCharge = (event, context, callback) => {
  
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
