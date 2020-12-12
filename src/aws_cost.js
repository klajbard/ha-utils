"use strict";

const fs = require("fs");
const exec = require("child_process").exec;
const { round, setState, timestampLog } = require("./utils");

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

function sendCost(cost) {
  const payload = {
    state: round(parseInt(cost)),
    attributes: {
      friendly_name: "AWS monthly cost",
      unit_of_measurement: "$",
      icon: "mdi:currency-usd",
    },
  };
  setState({ sensor: `sensor.aws_monthly_cost`, payload });
}

async function getAWSCost(logFile) {
  timestampLog(`[AWSCOST]: Querying...`);
  const today = new Date();
  const currentMonth = getMonth(today);
  const nextMonth = getMonth(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  );
  const command = `aws ce get-cost-and-usage --time-period Start=${currentMonth}-01,End=${nextMonth}-01 --granularity MONTHLY --metrics "BlendedCost"`;
  const { isPresent, err } = await isFilePresent(logFile);
  if (err) {
    throw new Error(err);
  }
  if (!isPresent) {
    timestampLog(`[AWSCOST]: ${logFile} is not found, creating...`);
    fs.writeFileSync(logFile, "");
  }
  if (today - fs.statSync(logFile).mtime > FILE_VALID_TIME || !isPresent) {
    execShellCommand(command).then((output) => {
      const cost = JSON.parse(output)["ResultsByTime"][0]["Total"][
        "BlendedCost"
      ]["Amount"];
      fs.promises.writeFile(logFile, cost).then(() => {
        timestampLog(`[AWSCOST]: Updated cost to ${cost}`);
        sendCost(cost);
      });
    });
  } else {
    fs.promises
      .readFile(logFile, "utf-8")
      .then(function (data) {
        sendCost(data);
        timestampLog(`[AWSCOST]: Updated cost to ${data}`);
      })
      .catch(function (err) {
        throw new Error(err);
      });
    timestampLog(`[AWSCOST]: Cost was recently updated.`);
  }
}

module.exports = {
  getAWSCost,
};
