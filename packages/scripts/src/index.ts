#!/usr/bin/env node

import yargs from "yargs";
import dotenv from "dotenv";
import path from "path";
import { appPath } from "./paths";

dotenv.config({ path: path.join(appPath, ".env") });

yargs.commandDir("commands/s3").demandCommand().help().argv;
