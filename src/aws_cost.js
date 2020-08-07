"use strict";

const fs = require("fs");
const exec = require("child_process").exec;
const { timestamp_log } = require("./utils");

const FILE_VALID_TIME = 1000 * 60 * 60 * 24 * 4; // 4 days

function execShellCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

function getMonth(today) {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  return `${year}-${month < 10 ? "0" : ""}${month}`;
}

async function isFilePresent(logFile) {
  let ret = {};
  await fs.promises
    .readFile(logFile)
    .then(() => {
      ret = { isPresent: true };
    })
    .catch((err) => {
      if (err.code === "ENOENT") {
        ret = { isPresent: false };
      } else {
        ret = { isPresent: false, err };
      }
    });
  return ret;
}

function getCost(logFile) {
  const today = new Date();
  const currentMonth = getMonth(today);
  const nextMonth = getMonth(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  );
  const command = `aws ce get-cost-and-usage --time-period Start=${currentMonth}-01,End=${nextMonth}-01 --granularity MONTHLY --metrics "BlendedCost"`;
  return new Promise(async (resolve, reject) => {
    const { isPresent, err } = await isFilePresent(logFile);
    if (err) {
      reject(err);
    }
    if (!isPresent) {
      timestamp_log(`[AWSCOST]: ${logFile} is not found, creating...`);
      fs.writeFileSync(logFile, "");
    }
    if (today - fs.statSync(logFile).mtime > FILE_VALID_TIME || !isPresent) {
      execShellCommand(command).then((output) => {
        const cost = JSON.parse(output)["ResultsByTime"][0]["Total"][
          "BlendedCost"
        ]["Amount"];
        fs.promises.writeFile(logFile, cost).then(() => {
          resolve(`[AWSCOST]: Current cost is ${cost}`);
        });
      });
    } else {
      resolve(`[AWSCOST]: Cost was recently updated.`);
    }
  });
}

function getAWSCost({ delay = 60000, logFile }) {
  timestamp_log(`[AWSCOST]: Querying...`);
  getCost(logFile)
    .then((msg) => timestamp_log(msg))
    .catch((err) => timestamp_log(`[AWSCOST]: ${err}`))
    .finally(() => {
      timestamp_log(`[AWSCOST]: Next run in ${delay}ms`);
    });
  setTimeout(function () {
    getAWSCost({ delay, logFile });
  }, delay);
}

module.exports = {
  getAWSCost,
};
