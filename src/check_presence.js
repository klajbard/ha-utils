"use strict";

const https = require("https");
const { JSDOM } = require("jsdom");
const { getData, getPostOptions, timestampLog } = require("./utils");

function callback(url, callbackLogic) {
  return function (body) {
    function getPostData() {
      return JSON.stringify({
        text: `Presence checker succeed: ${url} !`,
      });
    }

    const dom = new JSDOM(body);
    timestampLog(`[CHECK_PRESENCE]: Processing data...`);
    if (callbackLogic(dom)) {
      if (!process.env.SLACK_PRESENCE) {
        timestampLog(`[CHECK_PRESENCE]: No Slack API given.`);
        timestampLog(`[CHECK_PRESENCE]: Presence checker succeed: ${url}`);
        return;
      }
      const req = https.request(getPostOptions("presence"), (res) => {
        timestampLog(`[CHECK_PRESENCE]: statusCode: ${res.statusCode}`);
      });
      req.on("error", (e) => {
        console.error(e);
      });
      req.write(getPostData());
      req.end();
    }
  };
}

function check_presence({ delay = 60000, url, callbackLogic }) {
  timestampLog(`[CHECK_PRESENCE]: Querying...`);
  getData(url)
    .then(callback(url, callbackLogic))
    .catch((err) => timestampLog(`[CHECK_PRESENCE]: ${err}`))
    .finally(() => {
      timestampLog(`[CHECK_PRESENCE]: Next run in ${delay}ms`);
    });
  setTimeout(function () {
    check_presence({ delay, url, callbackLogic });
  }, delay);
}

module.exports = { check_presence };
