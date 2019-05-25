import React, { Component } from "react";
import Experiment, {
  registerAll,
  registerTask,
  createUpload
} from "@blainelewis1/cefn";
import TaskWithReducer, { reducer } from "./TaskWithReducer";
import AWS from "aws-sdk";

registerAll();
registerTask("TaskWithReducer", TaskWithReducer, reducer);
registerTask(
  "CustomTask",
  ({ text, onLog, onEditConfig, onAdvanceWorkflow }) => {
    return (
      <div
        onClick={() => {
          onLog("hello", "world");
          onEditConfig("content", "<h1>Hello world</h1>");
          onAdvanceWorkflow();
        }}
      >
        {text}
      </div>
    );
  }
);

const configuration = {
  CustomTask: {
    text: "This is a custom task. Click the paragraph to continue"
  },
  participant: "yo",
  children: [
    {
      task: "ConsentForm",
      letter: `# Consent Form

The consent form uses markdown to create a letter, and it automatically generates as many checkboxes as needed to consent.`,
      questions: [
        {
          label:
            "I consent of my free will to complete this example experiment",
          required: true
        }
      ]
    },
    {
      task: "CustomTask"
    },
    {
      task: "InformationScreen"
    },
    {
      task: "S3Upload",
      filename: "hello"
    },
    {
      task: "TaskWithReducer"
    }
  ]
};

const S3Upload = createUpload(
  createS3Uploader("us-east-2", "test", "testingBucket")
);

registerTask("S3Upload", S3Upload);

export function createS3Uploader(
  AWS_REGION,
  AWS_COGNITO_IDENTITY_POOL_ID,
  AWS_S3_BUCKET
) {
  AWS.config.region = AWS_REGION;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: AWS_COGNITO_IDENTITY_POOL_ID
  });

  let s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    params: { Bucket: AWS_S3_BUCKET }
  });
  // https://blog.mturk.com/tutorial-how-to-create-hits-that-ask-workers-to-upload-files-using-amazon-cognito-and-amazon-s3-38acb1108633
  return function(fileName, data) {
    return s3
      .upload({
        Key: fileName,
        Body: JSON.stringify(data),
        ContentType: "json",
        ACL: "bucket-owner-full-control"
      })
      .promise();
  };
}

export default class App extends Component {
  render() {
    return <Experiment configuration={configuration} />;
  }
}
