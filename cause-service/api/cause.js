'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();


module.exports.list = (event, context, callback) => {
  var params = {
        TableName: process.env.CAUSE_TABLE,
        ProjectionExpression: "id, causeName, details, country, image"
    };

    console.log("Scanning Causes table.");
    const onScan = (err, data) => {
        if (err) {
            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Scan succeeded.");
            console.log(JSON.stringify(data));
            return callback(null, {
                statusCode: 200,
                headers: {
                  "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                  "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
                },
                body: JSON.stringify(data.Items)
            });
        }

    };

    dynamoDb.scan(params, onScan);
};


  module.exports.create = (event, context, callback) => {  
  if (typeof event === 'undefined') {
    console.error('Validation Failed');
    callback(new Error(`Request body is undefined. ${JSON.stringify(event)}`));
    return;
  } 
  const requestBody = event;
  const causeName = requestBody.name;
  const details = requestBody.details;
  const country = requestBody.country;

  if (typeof causeName !== 'string' || typeof details !== 'string' || typeof country !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit cause because of validation errors.'));
    return;
  }

  submitCauseP(causeInfo(causeName, details, country))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted cause with name ${causeName}`,
          causeId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit cause with name ${causeName}`
        })
      })
    });
};



const submitCauseP = cause => {
  console.log('Submitting cause');
  const causeInfo = {
    TableName: process.env.CAUSE_TABLE,
    Item: cause,
  };
  return dynamoDb.put(causeInfo).promise()
    .then(res => cause);
};


const causeInfo = (causeName, details, country) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    organizationId: '123',
    causeName: causeName,
    details: details,
    country: country,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};
