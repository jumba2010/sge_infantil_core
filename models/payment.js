const constants = require("../utils/constants");

const paymentSchema = {
  TableName: constants.PAYMENT_TABLE,
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

module.exports = paymentSchema;