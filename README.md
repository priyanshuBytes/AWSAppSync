# Welcome to your CDK JavaScript project

This is a blank project for CDK development with JavaScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app. The build step is not required when using JavaScript.

## Useful commands

* `npm run test`         perform the jest unit tests
* `npx cdk deploy`       deploy this stack to your default AWS account/region
* `npx cdk diff`         compare deployed stack with current state
* `npx cdk synth`        emits the synthesized CloudFormation template

# AWSLambda Definition
Develop and maintain robust backend services, APIs, and microservices. Create microservices for a simplified real-life scenario using Node.js, integrating with AppSync &amp; Lambda.

### createItem Function

This asynchronous function creates a new item in a DynamoDB table. It generates a unique `ProductId` based on the current timestamp and a random string. It also sets the `createdAt` and `updatedAt` attributes to the current date and time.

#### Parameters:
- `input`: An object containing the data for the new item.

#### Return Value:
- Returns the newly created item with the generated `ProductId`.

#### Steps:
1. Generate a current timestamp using `new Date().toLocaleString()`.
2. Combine the input data with the generated `ProductId`, `createdAt`, and `updatedAt` attributes to create a new object (`itemWithTimestamps`).
3. Create DynamoDB parameters (`params`) including the table name from the environment variables and the `Item` object.
4. Send a `PutCommand` to DynamoDB to add the new item to the table.
5. Return the newly created item with timestamps.


### updateItem Function

This asynchronous function updates an item in a DynamoDB table based on the provided `ProductId`. It dynamically constructs the update expression and expression attribute values based on the `UpdateValue` object.

#### Parameters:
- `input`: An object containing the `ProductId` and `UpdateValue` to update the item.

#### Return Value:
- Returns the updated attributes of the item after the update operation.

#### Steps:
1. Extract the `ProductId` and `UpdateValue` from the input object.
2. Initialize arrays to store the update expression and expression attribute values.
3. Update the `updatedAt` attribute in the `UpdateValue` object with the current timestamp.
4. Iterate over the keys of the `UpdateValue` object and construct the update expression and expression attribute values dynamically.
5. Generate DynamoDB parameters including the table name, `ProductId`, update expression, expression attribute values, and return values.
6. Send an `UpdateCommand` to DynamoDB with the generated parameters.
7. Await the response from DynamoDB and return the updated attributes of the item.


### readItem Function

This asynchronous function retrieves an item from a DynamoDB table based on the provided `ProductId`.

#### Parameters:
- `input`: An object containing the `ProductId` of the item to be retrieved.

#### Return Value:
- Returns the item with the specified `ProductId` from the DynamoDB table.

#### Steps:
1. Generate DynamoDB parameters (`params`) including the table name from the environment variables and the `ProductId` as the key to retrieve the item.
2. Create a `GetItemCommand` with the generated parameters (`params`).
3. Send the command to DynamoDB using the `dbClient`.
4. Extract the `Item` from the response and return it.


### deleteItem Function

This asynchronous function deletes an item from a DynamoDB table based on the provided `ProductId`.

#### Parameters:
- `input`: An object containing the `ProductId` of the item to be deleted.

#### Return Value:
- Returns a success message indicating that the item was deleted successfully.

#### Steps:
1. Generate DynamoDB parameters (`params`) including the table name from the environment variables and the `ProductId` as the key to identify the item to be deleted.
2. Create a `DeleteItemCommand` with the generated parameters (`params`).
3. Send the command to DynamoDB using the `dbClient`.
4. Await the completion of the operation.
5. Return a success message indicating that the item was deleted successfully.

#### Note:
- This function assumes the existence of the `ddb` object, which is an instance of the DynamoDB client.
- The table name is retrieved from the `process.env.TableName`, indicating that the function relies on the environment variable `TableName` to determine the target DynamoDB table.

# AppSync Schema Definition

### Inputs

1. **CreateProduct**
   - `ProductName`: Required String
   - `Description`: Required String
   - `Price`: Required Integer
   - `Category`: Required String
   - `Stock`: Required Integer

2. **DeleteProduct**
   - `ProductId`: Required String

3. **GetProductId**
   - `ProductId`: Required String

4. **UpdateProduct**
   - `ProductId`: Required String
   - `UpdateValue`: Optional getItems object

5. **getItems**
   - `ProductName`: Optional String
   - `Description`: Optional String
   - `Price`: Optional Integer
   - `Category`: Optional String
   - `Stock`: Optional Integer

### Mutations

1. **createProduct**
   - `input`: CreateProduct
   - Returns: AWSJSON

2. **updateProduct**
   - `input`: UpdateProduct
   - Returns: AWSJSON

3. **deleteProduct**
   - `input`: DeleteProduct
   - Returns: AWSJSON

### Queries

1. **readProduct**
   - `input`: GetProductId
   - Returns: AWSJSON

### Schema Definition

```graphql
schema {
  query: Query
  mutation: Mutation
}

type Mutation {
  createProduct(input: CreateProduct!): AWSJSON
  updateProduct(input: UpdateProduct!): AWSJSON
  deleteProduct(input: DeleteProduct!): AWSJSON
}

type Query {
  readProduct(input: GetProductId!): AWSJSON
}

input CreateProduct {
  ProductName: String!
  Description: String!
  Price: Int!
  Category: String!
  Stock: Int!
}

input DeleteProduct {
  ProductId: String!
}

input GetProductId {
  ProductId: String!
}

input UpdateProduct {
  ProductId: String!
  UpdateValue: getItems!
}

input getItems {
  ProductName: String
  Description: String
  Price: Int
  Category: String
  Stock: Int
}
```

## Usage

This schema can be used to define an AWS AppSync API for managing product data. It supports creating, reading, updating, and deleting product information. The schema defines inputs for each operation and the expected return types.
