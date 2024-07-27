const { dynamoDBClient } = require('../config/awsConfig');

const constants=require('../utils/constants');
const {
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  ScanCommand,
} = require('@aws-sdk/client-dynamodb');

const { marshall } = require('@aws-sdk/util-dynamodb');
const { v4: uuidv4 } = require('uuid');
const {composeUdateFields,flattenAttributes}=require('../utils/DynamoDBUpdaterUtil');
const {getCurrentDateTime}=require('../utils/DatetimeUtils');

const marshallOptions = {
  removeUndefined: true, // Removes undefined attributes
  convertClassInstance: true, // Converts class instances to plain objects
};

const create = async (tableName,payload) => {
  
  try {
    payload.id = await uuidv4();
    payload.active = 1;
    payload.createdAt = getCurrentDateTime();

    let newPayload =removeEmpty(payload)

    const params = {
      TableName:tableName,
      Item: marshall(newPayload),
    };
    
    const command = new PutItemCommand(params);
    await dynamoDBClient.send(command);
    return payload;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const queryBySucursalId = async (tableName,sucursalId) => {
  try {
    const command = new QueryCommand({
      IndexName: 'sucursalId-index', 
      KeyConditionExpression: "sucursalId = :sucursalId",
      ExpressionAttributeValues: {
        ":sucursalId": { S: sucursalId }
      },
      TableName: tableName,
    });
  
    const response = await dynamoDBClient.send(command);
    return flattenAttributes(response.Items)
  } catch (error) {
    console.log(error);
    throw error;
  }
};



const findySucursalIdAnYear = async (tableName,sucursalId,year) => {

  if(!tableName || !sucursalId || !year){
    return []
  }

  try {
    const command = new QueryCommand({
      IndexName: 'sucursalId-index',
      KeyConditionExpression: "sucursalId = :sucursalId",
      ExpressionAttributeNames: {
        '#year': 'year',
        '#active':'active'
      },
      FilterExpression: "#year = :year and #active = :active",
      ExpressionAttributeValues: {
        ":sucursalId": { S: sucursalId },
        ":year": { N: year.toString() },
        ":active":{N: '1'}
      },
      TableName: tableName,
    });

    const response = await dynamoDBClient.send(command);
    return flattenAttributes(response.Items)
  } catch (error) {
    console.log(error);
    throw error;
  }
};


const queryBySucursalIdAnYear = async (tableName, sucursalId, year) => {
  if (!tableName || !sucursalId || !year) {
    return [];
  }

  console.log(tableName, sucursalId, year);

  let items = [];
  let i=1
  try {
    let lastEvaluatedKey = undefined;

    do {
      const params = {
        IndexName: 'sucursalId-index',
        TableName: tableName,
        ExpressionAttributeNames: {
          '#active': 'active',
          '#year': 'year'
        },
        ExpressionAttributeValues: {
          ":sucursalId": { S: sucursalId },
          ":year": { N: year.toString() },
          ":active": { N: '1' }
        },
        KeyConditionExpression: "sucursalId = :sucursalId",
        FilterExpression: "#active = :active and #year = :year",
        Limit: 500, 
        ExclusiveStartKey: lastEvaluatedKey // Provide the last evaluated key to continue from
      };

      const command = new QueryCommand(params); // Use Query instead of Scan
      const response = await dynamoDBClient.send(command);

      // Append items from current page to the result
      items.push(...response.Items);
      // Update last evaluated key for the next page
      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return flattenAttributes(items);
  } catch (error) {
    console.log(error);
    throw error;
  }
};



const parallelScan = async (tableName, totalSegments, queryParameters) => {
  const promises = [];

  // Launch parallel scan operations for each segment
  for (let segment = 0; segment < totalSegments; segment++) {
    promises.push(scanSegment(tableName, totalSegments, segment, queryParameters));
  }

  // Wait for all parallel scan operations to complete
  const results = await Promise.all(promises);

  // Combine results from all scan operations
  const combinedResults = results.reduce((accumulator, current) => {
    accumulator.push(...current);
    return accumulator;
  }, []);

  return combinedResults;
};

const scanSegment = async (tableName, totalSegments, segment, queryParameters) => {
  const params = {
    TableName: tableName,
    Segment: segment,
    TotalSegments: totalSegments,
    ...queryParameters
  };

  const command = new ScanCommand(params);

  try {
    const response = await dynamoDBClient.send(command);
    return response.Items;
  } catch (error) {
    console.error("Error scanning segment:", error);
    throw error;
  }
};

const queryBySucursalIdAndStatusAndYear = async (tableName,sucursalId,status,year) => {
  if(!tableName || !sucursalId || !year || !status){
    return []
  }

  console.log(tableName,sucursalId,status,year)
  try {
    const command = new QueryCommand({
      IndexName: 'sucursalId-index',
      KeyConditionExpression: "sucursalId = :sucursalId",
      FilterExpression: "#year = :year AND #status = :status and #active = :active",
      ExpressionAttributeNames: {
        '#year': 'year',
        '#status': 'status',
        '#active':'active'
      },
      ExpressionAttributeValues: {
        ":sucursalId": { S: sucursalId },
        ":year": { N: year.toString() },
        ":status": { N: status.toString()},
        ':active':{N:"1"}
      },
      TableName: tableName,
    });
  
    const response = await dynamoDBClient.send(command);
    return flattenAttributes(response.Items)
  } catch (error) {
    console.log(error);
    throw error;
  }
};


const queryUnpaidBySucursalId= async (tableName,sucursalId) => {
  if(!tableName || !sucursalId ){
    return []
  }

  try {
    const command = new QueryCommand({
      IndexName: 'sucursalId-index',
      KeyConditionExpression: "sucursalId = :sucursalId",
      FilterExpression: "#status = :status and #hasFine = :hasFine and #active = :active",
      ExpressionAttributeNames: {
        '#status': 'status',
        '#hasFine': 'hasFine',
        '#active': 'active',
      },
      ExpressionAttributeValues: {
        ":sucursalId": { S: sucursalId },
        ":status": { N: "0"},
        ":hasFine": { N: "1"},
        ":active":  {N: "1"},
      },
      TableName: tableName,
    });
  
    const response = await dynamoDBClient.send(command);
    return flattenAttributes(response.Items)
  } catch (error) {
    console.log(error);
    throw error;
  }
};


const readById = async (tableName,id) => {

  try {
    const params = {
      TableName: tableName,
      Key: marshall({ id: id }),
    };

    const command = new GetItemCommand(params);
    const response = await dynamoDBClient.send(command);

    if (!response.Item) {
      throw new Error('not_found',`${tableName} was not found by id ${id}`);
    }

    return flattenAttributes(response.Item);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const update = async (tableName,id, payload) => {
payload.updatedAt = getCurrentDateTime();
let newPayload =removeEmpty(payload)
let fieldsToUpdate=composeUdateFields(newPayload);

  try {
    const input = {
      ExpressionAttributeNames:fieldsToUpdate.expressionAttributeNames,
      ExpressionAttributeValues: fieldsToUpdate.expressionAttributeValues,
      Key: {
        "id": {
          S: id
        }
      },
      ReturnValues: "ALL_NEW",
      TableName: tableName,
      UpdateExpression:fieldsToUpdate.updateExpression,
    };

    const command = new UpdateItemCommand(input);
    await dynamoDBClient.send(command);

    return newPayload;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


const deleteRow = async (tableName,id) => {
  try {
    const params = {
      TableName:tableName,
      Key: marshall({ id: id }),
    };

    const command = new DeleteItemCommand(params);
    await dynamoDBClient.send(command);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const inactivate = async (tableName,id) => {
  try {
    const params = {
      Key: {
        "id": {
          S: id
        }
      },
      ReturnValues: "ALL_NEW",
      TableName: tableName,
      UpdateExpression: 'SET #active = :active',
      ExpressionAttributeNames: {
        '#active': 'active',
      },
      ExpressionAttributeValues: {
        ':active': {N: "0"}, 
      },
    };

    const command = new UpdateItemCommand(params);
    await dynamoDBClient.send(command);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const findActiveByUserName = async (tableName,username) => {
  try {
    const command = new QueryCommand({
      IndexName: 'sge-username-index', 
      KeyConditionExpression: "username = :username",
      FilterExpression: "#active = :active",
      ExpressionAttributeNames: {
        '#active': 'active',
      },
      ExpressionAttributeValues: {
        ":username": { S: username },
        ":active": { N: "1" }
      },
      TableName: tableName,
    });
    
    const response = await dynamoDBClient.send(command);
    return flattenAttributes(response.Items[0]);

  } catch (error) {
    console.log(error);
    throw error;
  }



};


const findPaymentsByRegistrationId = async (registrationId,sucursalId) => {
  if(!sucursalId ||  !registrationId){
    return []
  }
  
  try {
    const command = new QueryCommand({
      IndexName: 'sucursalId-index',
      KeyConditionExpression: "sucursalId = :sucursalId",
      FilterExpression: "#registrationId = :registrationId and #active = :active",
      ExpressionAttributeNames: {
        '#registrationId': 'registrationId',
        '#active': 'active',
      },
      ExpressionAttributeValues: {
        ":sucursalId": { S: sucursalId },
        ":registrationId": { S: registrationId },
        ":active":  {N: "1"},
        
      },
      TableName: constants.PAYMENT_TABLE,
    });
  
    const response = await dynamoDBClient.send(command);
    return flattenAttributes(response.Items)
  } catch (error) {
    console.log(error);
    throw error;
  }
};


const findCurrentByStudentId = async (tableName,studentId, sucursalId) => {
  if(!tableName || !sucursalId || !studentId ){
    return []
  }
  
  try {
    const command = new QueryCommand({
      IndexName: 'sucursalId-index',
      KeyConditionExpression: "sucursalId = :sucursalId",
      FilterExpression: "#studentId = :studentId and #active = :active",
      ExpressionAttributeNames: {
        '#studentId': 'studentId',
        '#active': 'active',
      },
      ExpressionAttributeValues: {
        ":sucursalId": { S: sucursalId },
        ":studentId": { S: studentId },
        ":active": {N : "1"}
      },
      TableName: tableName,
    });
  
    const response = await dynamoDBClient.send(command);
    return flattenAttributes(response.Items)
  } catch (error) {
    console.log(error);
    throw error;
  }
};


const findCurrentByStudentIdAndYear = async (tableName,studentId,year,sucursalId) => {
  
  if(!tableName || !sucursalId || !year || !studentId){
    return []
  }
  try {
    const command = new QueryCommand({
      IndexName: 'sucursalId-index',
      KeyConditionExpression: "sucursalId = :sucursalId",
      FilterExpression: "#studentId = :studentId AND #year = :year and #active = :active",
      ExpressionAttributeNames: {
        '#year': 'year',
        '#studentId': 'studentId',
        '#active': 'active'
      },
      ExpressionAttributeValues: {
        ":sucursalId": { S: sucursalId },
        ":studentId": { S: studentId },
        ":year": { N: year.toString() },
        ":active": {N: "1"},
      },
      TableName: tableName,
    });
  
    const response = await dynamoDBClient.send(command);
    return flattenAttributes(response.Items)
  } catch (error) {
    console.log(error);
    throw error;
  }
};

async function getMonthTotalAmount(sucursalId, year, month, status) {
  try {
    const params = {
      IndexName: 'sucursalId-index',
      TableName:constants.PAYMENT_TABLE,
      KeyConditionExpression: 'sucursalId = :sucursalId',
      FilterExpression: '#year = :year and #status = :status and #month = :month and #active = :active',
      ExpressionAttributeNames: {
        '#year': 'year',
        '#status': 'status',
        '#month': 'month',
        '#active': 'active',
      },

      ExpressionAttributeValues: {
        ':sucursalId': { S: sucursalId },
        ':year': { N: year.toString() },
        ':status': { N: status.toString() },
        ':month': { N: month.toString() },
        ':active': {N: "1"}
      }
    };

    const command = new QueryCommand(params);
    const response = await dynamoDBClient.send(command);

    // Calculate the total amount by summing 'total' attribute for all items
    const totalAmount =response.Items.length!=0? flattenAttributes(response.Items).reduce((total, payment) => total + parseFloat(payment.total), 0):0;
  
    return totalAmount;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getMonthCounts(sucursalId, year, month, status) {
  try {
    const params = {
      IndexName: 'sucursalId-index',
      TableName:constants.PAYMENT_TABLE,
      KeyConditionExpression: 'sucursalId = :sucursalId',
      FilterExpression: '#year = :year and #status = :status and #month = :month and #active = :active',
      ExpressionAttributeNames: {
        '#year': 'year',
        '#status': 'status',
        '#month': 'month',
        '#active': 'active',
      },

      ExpressionAttributeValues: {
        ':sucursalId': { S: sucursalId },
        ':year': { N: year.toString() },
        ':status': { N: status.toString() },
        ':month': { N: month.toString() },
        ':active': {N: "1"},
      }
    };

    const command = new QueryCommand(params);
    const response = await dynamoDBClient.send(command);

    return response.Count || 0;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


const removeEmpty = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
    else if (obj[key] !== undefined && obj[key] !== '') newObj[key] = obj[key];
  });
  return newObj;
};

module.exports = { 
  create, 
  update, 
  deleteRow, 
  inactivate,
  readById,
  queryBySucursalId,
  queryBySucursalIdAnYear,
  findActiveByUserName,
  queryBySucursalIdAndStatusAndYear,
  findPaymentsByRegistrationId,
  findCurrentByStudentId,
  findCurrentByStudentIdAndYear,
  queryUnpaidBySucursalId,
  getMonthTotalAmount,
  getMonthCounts,
  findySucursalIdAnYear,
 };
