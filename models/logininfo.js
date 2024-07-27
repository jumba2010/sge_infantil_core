const constants = require("../utils/constants");

const logginInfoSchema = {
  TableName: constants.LOGININFO_TABLE,
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

module.exports = logginInfoSchema;
