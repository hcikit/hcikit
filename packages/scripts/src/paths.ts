import path from "path";
import fs from "fs";

const appDirectory = fs.realpathSync(process.cwd());

const resolveApp = (relativePath: string) =>
  path.resolve(appDirectory, relativePath);

const resolveOwn = (relativePath: string) =>
  path.resolve(__dirname, relativePath);

export let appPath = resolveApp(".");
export let appPackageJson = resolveApp("package.json");
export let ownPath = resolveOwn(".");
