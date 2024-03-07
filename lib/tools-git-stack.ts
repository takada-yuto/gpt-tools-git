import * as cdk from 'aws-cdk-lib'
import { CfnOutput } from 'aws-cdk-lib'
import {
  Distribution,
  PriceClass,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import path = require('path')



export class ToolsGitStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const assetsBucket = new cdk.aws_s3.Bucket(this, "assetsBucket",{
      bucketName: `tools-gitlab-api-bucket`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const assetsDistribution = new Distribution(this, 'assetsDistribution', {
      comment: 'FunctionCalling GitAPIApp',
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          ttl: cdk.Duration.seconds(300),
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          ttl: cdk.Duration.seconds(300),
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      defaultBehavior: {
        origin: new cdk.aws_cloudfront_origins.S3Origin(assetsBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      priceClass: PriceClass.PRICE_CLASS_ALL,
    })

    new BucketDeployment(this, 'assetsDeploy', {
      sources: [Source.asset(path.join(__dirname, '../vite/dist'))],
      destinationBucket: assetsBucket,
      distribution: assetsDistribution,
      distributionPaths: ['/*'],
    })

    new CfnOutput(this, 'Distribution DomainName', {
      value: assetsDistribution.domainName,
    })

  }
}
