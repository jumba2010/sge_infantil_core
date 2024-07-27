const constants = require("../utils/constants");

const smsSchema = {
  TableName: constants.SMS_TABLE,
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' }
  ],
  BillingMode: 'PAY_PER_REQUEST', 
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH',
    }
    
  ],
};

module.exports = smsSchema;