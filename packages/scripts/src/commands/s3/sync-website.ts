#!/usr/bin/env node

import S3SyncClient from "s3-sync-client";
import { PutObjectCommandInput } from "@aws-sdk/client-s3";
import path from "path";
import { appPath } from "../../paths";
import mime from "mime-types";

export let command = "s3-sync-website";

export let describe =
  "Use environment variables to sync the build folder with the website.";

exports.handler = async () => {
  const sync = new S3SyncClient({});

  console.log("Uploading...");

  let dir = path.join(appPath, "build");
  await sync.bucketWithLocal(
    dir,
    process.env.REACT_APP_AWS_WEBSITE_BUCKET,
    {},
    {
      ACL: "bucket-owner-full-control",
      ContentType: ({ Key }: Partial<PutObjectCommandInput>) =>
        mime.lookup(Key || "") || "text/html",
    }
  );

  console.log(
    `Upload complete. Visit your website at ${process.env.REACT_APP_AWS_WEBSITE_URL}`
  );
};
