#!/usr/bin/env node

import {
  CloudFormationClient,
  DeleteStackCommand,
} from "@aws-sdk/client-cloudformation";

import { appPackageJson } from "../../paths";

export let command = "s3-cleanup";

export let builder = {
  region: {
    default: "us-east-2",
    alias: ["aws-region", "r"],
  },
};

export let describe =
  "Uses the app name from package.json and deletes all related S3 storage items from AWS.";

exports.handler = async ({ region }: { region?: string }) => {
  const appPackage = require(appPackageJson);
  let appName = appPackage.name;

  let client = new CloudFormationClient({ region });

  let createCommand = new DeleteStackCommand({
    StackName: appName,
  });

  let output = await client.send(createCommand);
  console.log(output);
  // TODO: this doesn't mean it actually suceeded...
};
