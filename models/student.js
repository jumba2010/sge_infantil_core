const constants = require("../utils/constants");

const studentSchema = {
  TableName: constants.STUDENT_TABLE,
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

module.exports = studentSchema;