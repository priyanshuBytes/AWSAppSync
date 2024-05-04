const { Stack, Duration } = require('aws-cdk-lib');
const cdk = require('aws-cdk-lib');
const { LambdaStage } = require('./lambda-stage');
const { AmplifyStage } = require('./amplify-stage');
const { TestStage } = require('./test-stage');
// const sqs = require('aws-cdk-lib/aws-sqs');
const { CodePipeline, CodePipelineSource, ShellStep } = require('aws-cdk-lib/pipelines');
class AssesmentStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'assesmentPipeline',
      crossAccountKeys: true,
      publishAssetsInParallel: false,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(props.env.codeOwner + '/sch-pipeline', 'main', {
          actionName: 'github-token-action',

          //authentication: cdk.SecretValue.secretsManager('arn:aws:secretsmanager:ap-south-1:238171122780:secret:sch/pipeline/git_token-suE4Tj', { jsonField: 'sch_pipeline_git_token' }),
          //authentication: cdk.SecretValue.ssmSecure('sch_pipeline_git_token', 1),
          authentication: cdk.SecretValue.unsafePlainText('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'),
          // read authentication token from ssm
          // authentication: cdk.SecretValue.ssmSecure('sch_pipeline_git_token', 1),
          trigger: 'None',//WEBHOOK,POLL,None

        }),
        commands: [

          'sudo rm /usr/local/bin/aws && sudo rm /usr/local/bin/aws_completer && sudo rm -rf /usr/local/aws-cli',
          'curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && sudo ./aws/install',
          'npm install -g aws-cdk',
          'npm ci',
          'cdk synth'
        ]
      })
    });
    pipeline.addStage(new AppStage(this, "app-stage", {
      env: { account: props.env.account, region: props.env.region}
    }));

  }
}

module.exports = { SchPipelineStack }
