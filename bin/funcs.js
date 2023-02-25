const path = require("path");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const download = require("download-git-repo");
const githubDownload = util.promisify(download);
const deleteFile = util.promisify(fs.unlink);

exports.processParams = async (projectLocation) => {
  const projectPath = path.join(process.cwd(), projectLocation);
  const projectName =
    projectLocation === "."
      ? path.basename(projectPath)
      : path.basename(projectLocation);
  return { projectPath, projectName };
};

exports.validateParams = async (projectLocation) => {
  // check that there is a project location provided
  if (!projectLocation) {
    console.log(`  You need to specify a project directory:
    ${chalk.yellow("make-sreact-app")} ${chalk.bgRed("<project-directory>")}

  For example:
    ${chalk.yellow("make-sreact-app")} ${chalk.green("my-example-app")}
    `);
    return false;
  }
  return true;
};

exports.createFolder = async (projectPath) => {
  // create folder if it does not exist
  const folderExists = fs.existsSync(projectPath);
  if (!folderExists) {
    process.stdout.write("  Creating project directory asap...");
    fs.mkdirSync(projectPath, { recursive: true });
    process.stdout.write(chalk.bgCyan(" DONE \n"));
  }
};

exports.downloadTemplate = async (templateUrl, projectPath) => {
  // download template project from github
  process.stdout.write("  Downloading template project from github...");
  await githubDownload(templateUrl, projectPath);
  process.stdout.write(chalk.bgCyan(" DONE \n\n"));
};

exports.updateProjectFiles = async (projectPath, projectName) => {
  // change package.json project name
  const pkgJsonPath = path.join(projectPath, "package.json");
  const packageJSON = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  const newPackageJSON = { ...packageJSON, name: projectName, description: "" };

  fs.writeFileSync(
    pkgJsonPath,
    JSON.stringify(newPackageJSON, null, 2),
    "utf8",
  );

  // delete unnecessary files
  await deleteFile(path.join(projectPath, "LICENSE"));
};

exports.notifyUser = async (projectPath, projectName) => {
  // notify user that the app is ready
  console.log(`${chalk.bgMagenta(chalk.cyanBright("  SUCCESS⚡  "))}

  Created project ${chalk.bgYellow(projectName)} at ${chalk.bold(projectPath)}
  Go to that directory and run these following commands:

    1. ${chalk.magenta("npm install")} or ${chalk.cyan(
    "yarn install",
  )} to install needed dependencies for your app

    2. ${chalk.magenta("npm start")} or ${chalk.cyan(
    "yarn start",
  )} to start the app

  ${chalk.bgMagenta("ENJOY✌")}

  ${chalk.underline("Report any issues at github.com/AsherCarneiro/make-sreact-app/issues")}
`);
};
