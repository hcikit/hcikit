#!/usr/bin/env node

import S3SyncClient from "s3-sync-client";
import fs from "fs-extra";
import { appPath } from "../../paths";
import path from "path";

export let command = "s3-sync-data";

export let describe =
  "Use environment variables to sync the data uploads to the data folder locally.";

exports.handler = async () => {
  const sync = new S3SyncClient({});

  let dir = path.join(appPath, "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  await sync.localWithBucket(process.env.REACT_APP_AWS_UPLOADS_BUCKET, dir);
  // aws s3 sync /path/to/local/dir s3://mybucket2
};
