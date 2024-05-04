const cdk = require('aws-cdk-lib');
const path = require('path');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
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

    let checkAccountStatusLambda = new Function(this, 'CURDFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      role: role,
      code: Code.fromAsset(path.join(__dirname, 'lambda')),
      environment:{
        TableName: 'Products'
      }
    });

  }
}

module.exports = { AppStack }