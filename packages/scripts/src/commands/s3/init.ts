#!/usr/bin/env node

import chalk from "chalk";
import { find } from "lodash";

import {
  Capability,
  CloudFormationClient,
  CreateStackCommand,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";

import fs from "fs-extra";
import os from "os";
import path from "path";
import spawn from "cross-spawn";

import { appPackageJson, appPath, ownPath } from "../../paths";

function PromiseTimeout(delayms: number) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, delayms);
  });
}
export let command = "s3-init";

export let describe =
  "Uses the app name from package.json and creates all related S3 storage items from AWS.";

export let builder = {
  region: {
    default: "us-east-2",

    alias: ["aws-region", "r"],
  },
};

// TODO: add some more info about getting credentials working: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html

exports.handler = async ({ region }: { region?: string }) => {
  const appPackage = require(appPackageJson);
  let appName = appPackage.name;

  let client = new CloudFormationClient({ region });

  let createCommand = new CreateStackCommand({
    StackName: appName,
    Capabilities: [Capability.CAPABILITY_IAM],
    TemplateBody: fs
      .readFileSync(path.join(ownPath, "./CreateBucket.yml"))
      .toString(),
  });

  await client.send(createCommand);
  console.log("Creating resources...");

  let describeCommand = new DescribeStacksCommand({ StackName: appName });

  let variables = await client.send(describeCommand);

  let stack = find(variables.Stacks, { StackName: appName });
  let retries = 0;
  let maxRetries = 10;
  let delay = 5000;

  while (!stack || !stack.Outputs) {
    if (retries >= maxRetries) {
      console.log("Could not find output variables");
      return;
    }

    // TODO: if the commit failed (in case the stack is in a mistaken state, then this all just keeps waiting. This should instead try to get the stackstatus.)
    await PromiseTimeout(delay);
    console.log("...");
    let variables = await client.send(describeCommand);
    stack = find(variables.Stacks, { StackName: appName });

    retries++;
  }

  console.log("Resources created.");

  let cognitoPoolId = find(stack?.Outputs, {
    OutputKey: "CognitoId",
  })?.OutputValue;
  let websiteUrl = find(stack?.Outputs, {
    OutputKey: "WebsiteURL",
  })?.OutputValue;
  let uploadsBucket = find(stack?.Outputs, {
    OutputKey: "UploadsId",
  })?.OutputValue;
  let websiteBucket = find(stack?.Outputs, {
    OutputKey: "WebsiteBucket",
  })?.OutputValue;

  fs.appendFileSync(
    path.join(appPath, ".env"),
    `
REACT_APP_AWS_REGION=${region}
REACT_APP_AWS_COGNITO_POOL_ID=${cognitoPoolId}
REACT_APP_AWS_WEBSITE_BUCKET=${websiteBucket}
REACT_APP_AWS_UPLOADS_BUCKET=${uploadsBucket}
REACT_APP_AWS_WEBSITE_URL=${websiteUrl}`
  );

  console.log(`S3 Setup Complete!`);

  console.log(
    `You still need to register the upload component and add it into your configuration to start logging.

          ${chalk.yellow(`import S3Upload from "./S3Upload";`)}

  Then register by passing it to your experiment in the tasks object.`
  );

  console.log(`Add it to your config like:
    ${chalk.yellow(`{
      task: 'S3Upload',
      filename: 'blaine_log',
      experimenter: 'hello@world.com',
    }`)}
        `);

  console.log();

  console.log(
    `You can now deploy to s3 by running ${chalk.blue("npm run deploy")}.`
  );

  console.log(
    `Your experiment will be accessible from ${chalk.green(websiteUrl)}.`
  );

  console.log(
    `You can view completed logs at ${chalk.green(
      `https://s3.console.aws.amazon.com/s3/buckets/${uploadsBucket}/`
    )}.`
  );

  console.log(
    `Or download them by running ${chalk.blue("npm run sync-data")}.`
  );
  console.log(
    "For deploying and downloading logs you must first install the aws-cli."
  );

  // TODO: Explaining how to setup credentials is tricky, it would be nice if there was a better way.
  const commandName = "hcikit";

  appPackage.scripts = appPackage.scripts || {};
  appPackage.scripts.deploy = `${commandName} s3-sync-website`;
  appPackage.scripts.predeploy = "npm run build";
  appPackage.scripts["sync-data"] = `${commandName} s3-sync-data`;

  fs.writeFileSync(
    path.join(appPath, "package.json"),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );

  // TODO: Could use environment variables...
  fs.writeFileSync(
    path.join(appPath, "src", "S3Upload.js"),
    `
  import { createS3Uploader } from "@hcikit/s3-uploader";
  import { createUpload } from "@hcikit/react";

  let uploadComponent = createUpload(
  createS3Uploader(
    "${region}",
    "${cognitoPoolId}",
    "${uploadsBucket}"
  )
  );

  export default uploadComponent;
  `
  );

  const useYarn = fs.existsSync(path.join(appPath, "yarn.lock"));

  let args;
  let cmd;

  if (useYarn) {
    cmd = "yarnpkg";
    args = ["add"];
  } else {
    cmd = "npm";
    args = ["install", "--save"].filter((e) => e);
  }

  args.push("@hcikit/s3-uploader");

  spawn.sync(cmd, args, { stdio: "inherit" });
};
