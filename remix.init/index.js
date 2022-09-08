const { execSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const toml = require("@iarna/toml");
const YAML = require("yaml");
const sort = require("sort-package-json");

function escapeRegExp(string) {
  // $& means the whole matched string
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getRandomString(length) {
  return crypto.randomBytes(length).toString("hex");
}

async function main({ rootDirectory, packageManager, isTypeScript }) {
  const README_PATH = path.join(rootDirectory, "README.md");
  const FLY_TOML_PATH = path.join(rootDirectory, "fly.toml");
  const EXAMPLE_ENV_PATH = path.join(rootDirectory, ".env.example");
  const ENV_PATH = path.join(rootDirectory, ".env");
  const PACKAGE_JSON_PATH = path.join(rootDirectory, "package.json");
  const DEPLOY_YAML_PATH = path.join(rootDirectory, ".circleci/config.yml");
  const DOCKERFILE_PATH = path.join(rootDirectory, "Dockerfile");
  const EMAIL_SENDER_PATH = path.join(
    rootDirectory,
    "app/lib/emails.server.ts"
  );

  const REPLACER = "folk-stack-template";

  const DIR_NAME = path.basename(rootDirectory);
  const SUFFIX = getRandomString(2);

  const APP_NAME = (DIR_NAME + "-" + SUFFIX)
    // get rid of anything that's not allowed in an app name
    .replace(/[^a-zA-Z0-9-_]/g, "-");

  const [
    prodContent,
    readme,
    env,
    packageJson,
    deployConfig,
    dockerfile,
    emailSender,
  ] = await Promise.all([
    fs.readFile(FLY_TOML_PATH, "utf-8"),
    fs.readFile(README_PATH, "utf-8"),
    fs.readFile(EXAMPLE_ENV_PATH, "utf-8"),
    fs.readFile(PACKAGE_JSON_PATH, "utf-8").then((s) => JSON.parse(s)),
    fs.readFile(DEPLOY_YAML_PATH, "utf-8").then((s) => YAML.parse(s)),
    fs.readFile(DOCKERFILE_PATH, "utf-8"),
    fs.readFile(EMAIL_SENDER_PATH, "utf-8"),
  ]);

  const newEnv = env
    .replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET="${getRandomString(16)}"`)
    .replace(REPLACER, APP_NAME);

  const prodToml = toml.parse(prodContent);
  prodToml.app = prodToml.app.replace(REPLACER, APP_NAME);

  const newReadme = readme.replace(
    new RegExp(escapeRegExp(REPLACER), "g"),
    APP_NAME
  );

  const newEmailSender = emailSender.replace(REPLACER, APP_NAME);

  let saveDeploy = null;
  if (!isTypeScript) {
    delete packageJson.scripts.typecheck;
    packageJson.scripts.validate = packageJson.scripts.validate.replace(
      " typecheck",
      ""
    );

    delete deployConfig.jobs.typecheck;
    deployConfig.jobs.deploy.needs = deployConfig.jobs.deploy.needs.filter(
      (n) => n !== "typecheck"
    );
    // only write the deploy config if it's changed
    saveDeploy = fs.writeFile(DEPLOY_YAML_PATH, YAML.stringify(deployConfig));
  }

  const newPackageJson =
    JSON.stringify(sort({ ...packageJson, name: APP_NAME }), null, 2) + "\n";

  const lockfile = {
    npm: "package-lock.json",
    yarn: "yarn.lock",
    pnpm: "pnpm-lock.yaml",
  }[packageManager];

  const newDockerfile = lockfile
    ? dockerfile.replace(
        new RegExp(escapeRegExp("ADD package.json"), "g"),
        `ADD package.json ${lockfile}`
      )
    : dockerfile;

  await Promise.all([
    fs.writeFile(FLY_TOML_PATH, toml.stringify(prodToml)),
    fs.writeFile(README_PATH, newReadme),
    fs.writeFile(ENV_PATH, newEnv),
    fs.writeFile(PACKAGE_JSON_PATH, newPackageJson),
    fs.writeFile(DOCKERFILE_PATH, newDockerfile),
    fs.writeFile(EMAIL_SENDER_PATH, newEmailSender),
    saveDeploy,
    fs.copyFile(
      path.join(rootDirectory, "remix.init", "gitignore"),
      path.join(rootDirectory, ".gitignore")
    ),
  ]);

  execSync("npm run format -- --loglevel warn", {
    stdio: "inherit",
    cwd: rootDirectory,
  });

  console.log(
    `
Setup is almost complete. Follow these steps to finish initialization:
- Start the database:
  npm run docker
- Run setup (this updates the database):
  npm run setup
- Run the first build (this generates the server you will run):
  npm run build
- You're now ready to rock and roll 🤘
  npm run dev
    `.trim()
  );
}

module.exports = main;
