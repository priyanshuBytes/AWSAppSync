const cdk = require('aws-cdk-lib');
const path = require('path');
const { Function, InlineCode, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { UserPool, Mfa, SESEmail, UserPoolEmail } = require('aws-cdk-lib/aws-cognito');
const { Role, ServicePrincipal, PolicyStatement, Effect } = require('aws-cdk-lib/aws-iam');
const { RestApi, LambdaIntegration, CognitoUserPoolsAuthorizer, AuthorizationType } = require('aws-cdk-lib/aws-apigateway');
const { StateMachine, DefinitionBody, Activity } = require('aws-cdk-lib/aws-stepfunctions');
const { StringParameter } = require('aws-cdk-lib/aws-ssm');
const { Bucket } = require('aws-cdk-lib/aws-s3');

const { App, GitHubSourceCodeProvider, Branch, RedirectStatus, CustomRule } = require('@aws-cdk/aws-amplify-alpha');
// include aws-cdk-lib for dynamodb
const { Table, AttributeType, BillingMode } = require('aws-cdk-lib/aws-dynamodb');
const { CognitoStack } = require('./cognito-stack');
const { ApiStack } = require('./api-stack');
const { DomainStack } = require('./domain-stack');
const { SqsEventSource } = require('aws-cdk-lib/aws-lambda-event-sources');
const { Queue, QueueEncryption } = require('aws-cdk-lib/aws-sqs');
class AppStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);


    const dynamoTable = new Table(this, 'Products', {
      tableName: 'Products',
      partitionKey: { name: 'ProductId', type: AttributeType.STRING },
      //billingMode: BillingMode.PAY_PER_REQUEST,
      // read capacity units
      readCapacity: 5,
      // write capacity units
      writeCapacity: 5,
      // enable point in time recovery
      //pointInTimeRecovery: true,
      // enable server side encryption
      //serverSideEncryption: true,
      // enable auto scaling
      autoScale: {
        autoScale: {
          minCapacity: 1,
          maxCapacity: 5,
        },
        //scaleInCooldown: cdk.Duration.seconds(60),
        //scaleOutCooldown: cdk.Duration.seconds(60),
        //targetValue: 80,
        //disableScaleIn: false,
        //disableScaleOut: false,
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
      runtime: Runtime.NODEJS_18_X,
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