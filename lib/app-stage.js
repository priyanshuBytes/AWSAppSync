const cdk = require('aws-cdk-lib');
const { AppStack } = require('./app-stack');
class AppStage extends cdk.Stage {

    constructor(scope, id, props) {
        super(scope, id, props);

        const lambdaStack = new AppStack(this, 'AppStack', {
            env: { codeOwner: this.codeOwner }
        });
    }
}

module.exports = { AppStage };