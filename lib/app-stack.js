const cdk = require('aws-cdk-lib');
const path = require('path');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const appsync = require('aws-cdk-lib/aws-appsync');
const { Role, ServicePrincipal, PolicyStatement, Effect } = require('aws-cdk-lib/aws-iam');
// include aws-cdk-lib for dynamodb
const { Table, AttributeType, BillingMode } = require('aws-cdk-lib/aws-dynamodb');
const { SqsEventSource } = require('aws-cdk-lib/aws-lambda-event-sources');

class AppStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);


    const dynamoTable = new Table(this, 'Products', {
      tableName: 'Products',
      partitionKey: { name: 'ProductId', type: AttributeType.STRING },
      readCapacity: 5,
      writeCapacity: 5,
      autoScale: {
        autoScale: {
          minCapacity: 1,
          maxCapacity: 5,
        }
      },
    });

    const role = new Role(this, 'LambdaRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),   // required
      description: 'Role created for lambda',
    });
    role.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      resources: '*',
      actions: '*',
    }));

    let CURDFunction = new Function(this, 'CURDFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      role: role,
      code: Code.fromAsset(path.join(__dirname, 'lambda')),
      environment:{
        TableName: 'Products'
      }
    });

    const api = new appsync.GraphqlApi(this, 'Api', {
        name: 'CURDApi',
        definition: appsync.Definition.fromFile(path.join(__dirname, 'appSync/schema.graphql')),
        authorizationConfig: {
          defaultAuthorization: {
            authorizationType: appsync.AuthorizationType.IAM,
          },
        },
        xrayEnabled: false,
      });
      
      const demoDS = api.addLambdaDataSource('CURDDataSource', CURDFunction);
      
      // Resolver for the Query "getDemos" that scans the DynamoDb table and returns the entire list.
      // Resolver Mapping Template Reference:
      // https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference-dynamodb.html
      demoDS.createResolver('QueryCURDResolver', {
        typeName: 'Query',
        fieldName: 'readProduct',
        requestMappingTemplate: appsync.MappingTemplate.lambdaRequest({
            "version" : "2017-02-28",
            "operation": "Invoke",
            "payload": '$util.toJson($context)'
          }),
        responseMappingTemplate: appsync.MappingTemplate.lambdaResult(
            '$util.toJson($context.result)'
        ),
      });
      
      // Resolver for the Mutation "addDemo" that puts the item into the DynamoDb table.
      demoDS.createResolver('CreateCURDResolver', {
        typeName: 'Mutation',
        fieldName: 'createProduct',
        requestMappingTemplate: appsync.MappingTemplate.lambdaRequest({
            "version" : "2017-02-28",
            "operation": "Invoke",
            "payload": '$util.toJson($context)'
          }),
        responseMappingTemplate: appsync.MappingTemplate.lambdaResult(
            '$util.toJson($context.result)'
        ),
      });

      demoDS.createResolver('UpdateCURDResolver', {
        typeName: 'Mutation',
        fieldName: 'updateProduct',
        requestMappingTemplate: appsync.MappingTemplate.lambdaRequest({
            "version" : "2017-02-28",
            "operation": "Invoke",
            "payload": '$util.toJson($context)'
          }),
        responseMappingTemplate: appsync.MappingTemplate.lambdaResult(
            '$util.toJson($context.result)'
        ),
      });

      demoDS.createResolver('DeleteCURDResolver', {
        typeName: 'Mutation',
        fieldName: 'deleteProduct',
        requestMappingTemplate: appsync.MappingTemplate.lambdaRequest({
            "version" : "2017-02-28",
            "operation": "Invoke",
            "payload": '$util.toJson($context)'
          }),
        responseMappingTemplate: appsync.MappingTemplate.lambdaResult(
            '$util.toJson($context.result)'
        ),
      });

      const table = new Table(this, 'ProductTaxonomyAttributes', {
        partitionKey: { name: 'TaxonomyId', type: AttributeType.STRING },
        globalSecondaryIndexes: [
            {
              indexName: 'ParentIndex',
              partitionKey: { name: 'ParentId', type: AttributeType.STRING },
              readCapacity: 5
            }
        ]
      });
  }
}

module.exports = { AppStack }