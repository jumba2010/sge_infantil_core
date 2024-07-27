const { DynamoDBClient, ScanCommand, QueryCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

const constants =require ("./utils/constants");
const crudService = require("./services/crudService");

const {composeUdateFields,flattenAttributes}=require('./utils/DynamoDBUpdaterUtil');

const { dynamoDBClient } = require('./config/awsConfig');

exports.handler = async (event) => {
    try {
        console.log('Starting monthly payment processing task')
        // Fetch all sucursals from the SGE_SUCURSAL table
        const sucursals = await fetchAllSucursals();

        for (const sucursal of sucursals) {
            console.log('Processing sucursal ',sucursal.code )
            const payments = await fetchPaymentsBySucursalId(sucursal.id);
            for (const payment of payments) { 
                const currentDate = new Date().toISOString().split('T')[0];
               if (payment?.dateLimit < currentDate && payment.hasFine == "0" && payment.status == "0") {
                    console.log('Updating Payment ',payment.year,payment.month,payment.dateLimit)
                     const payload = {hasFine:1}  
                    await crudService.update(constants.PAYMENT_TABLE,payment.id,payload)
             }
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify('Scheduled task executed successfully.'),
        };
    } catch (error) {
        console.error('Error executing the scheduled task:', error);
        throw error;
    }
};

async function fetchAllSucursals() {
    const params = {
        TableName: constants.SUCURSAL_TABLE, 
    };

    const command = new ScanCommand(params);
    const result = await dynamoDBClient.send(command);
    return flattenAttributes(result.Items);
}

async function fetchPaymentsBySucursalId(sucursalId) {
    let year = new Date().getFullYear().toString();
    let month = (new Date().getMonth()+1).toString();
    const params = {
        TableName: constants.PAYMENT_TABLE,
        IndexName: 'sucursalId-index', 
        KeyConditionExpression: 'sucursalId = :sucursalId',
        FilterExpression: '#status = :status AND #year = :year AND #month <= :month',
        ExpressionAttributeValues: {
            ":sucursalId": { S: sucursalId },
            ":status": { N: "0" },
            ":year": { N: year },
            ":month": { N: month },
        },
        ExpressionAttributeNames: {
            "#status": "status",
            "#year": "year",
            "#month": "month",
        },
    };

    const command = new QueryCommand(params);
    const result = await dynamoDBClient.send(command);
    return flattenAttributes(result.Items);
}
