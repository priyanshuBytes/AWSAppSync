import { DynamoDBClient , GetItemCommand , DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(dbClient);


export const handler = async (event) => {
    console.log(event);
    const { fieldName: operation } = event.info;
    const { input: input } = event.arguments;
    
    try {
        switch(operation) {
            case "createProduct":
                return await createItem(input);
            case "readProduct":
                return await readItem(input);
            case "updateProduct":
                return await updateItem(input);
            case "deleteProduct":
                return await deleteItem(input);
            default:
                return "Unsupported operation";
        }
    } catch (error) {
        console.error("Error:", error);
        return error;
    }
};

const createItem = async (input) => {
    const CreateNupdate = new Date().toLocaleString();
    const itemWithTimestamps = {
            ...input,
            ProductId: Date.now().toString(36) + Math.random().toString(36).substring(2, 8), // Convert current timestamp to base36 string
            createdAt: CreateNupdate,
            updatedAt: CreateNupdate
        };
    // Generate DynamoDB parameters
    const params = {
        TableName: process.env.TableName,
        Item: itemWithTimestamps
    };
    
    // Perform the put operation
    await ddb.send(new PutCommand(params));
    return itemWithTimestamps;
};

const updateItem = async (input) => {
    
    const { ProductId, UpdateValue } = input; // Extract primaryKey and other update values
    const updateExpression = [];
    const expressionAttributeValues = {};
    UpdateValue.updatedAt = new Date().toLocaleString();
    
    // Construct update expression and expression attribute values dynamically
    Object.keys(UpdateValue).forEach((key, index) => {
        if(typeof UpdateValue[key] !== 'undefined' && UpdateValue[key] !== null && UpdateValue[key] !== ''){
            const placeholder = `:val${index}`;
            updateExpression.push(`${key} = ${placeholder}`);
            expressionAttributeValues[placeholder] = UpdateValue[key];
        }
    });

    // Generate DynamoDB parameters
    if(updateExpression.length !== 0){
        const params = {
            TableName: process.env.TableName,
            Key: {
                ProductId
            },
            UpdateExpression: "set " + updateExpression.join(", "),
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "ALL_NEW"
        };
        
        const data = await ddb.send(new UpdateCommand(params));
        return data.Attributes;
    }
    return "No modification in table";
};

const readItem = async (input) => {

    // Generate DynamoDB parameters
    const params = {
        TableName: process.env.TableName,
        Key: {
            ProductId : {
                S:input.ProductId
            }
            
        }
    };
    
    const command = new GetItemCommand(params);
    const { Item } = await dbClient.send(command);
    return Item;
};

const deleteItem = async (input) => {
    
    const params = {
        TableName: process.env.TableName,
        Key: {
            ProductId: {
                S : input.ProductId
            }
        }
    };
    await dbClient.send(new DeleteItemCommand(params));
    return "Item deleted successfully";
};
