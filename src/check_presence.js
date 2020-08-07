"use strict";

const https = require("https");
const { JSDOM } = require("jsdom");
const { getData, getPostOptions, timestamp_log } = require("./utils");

function callback(url, callbackLogic) {
  return function (body) {
    function getPostData() {
      return JSON.stringify({
        text: `Presence checker succeed: ${url} !`,
      });
    }

    const dom = new JSDOM(body);
    timestamp_log(`[CHECK_PRESENCE]: Processing data...`);
    if (callbackLogic(dom)) {
      if (!process.env.SLACK_PRESENCE) {
        timestamp_log(`[CHECK_PRESENCE]: No Slack API given.`);
        timestamp_log(`[CHECK_PRESENCE]: Presence checker succeed: ${url}`);
        return;
      }
      const req = https.request(getPostOptions("presence"), (res) => {
        timestamp_log(`[CHECK_PRESENCE]: statusCode: ${res.statusCode}`);
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
  timestamp_log(`[CHECK_PRESENCE]: Querying...`);
  getData(url)
    .then(callback(url, callbackLogic))
    .catch((err) => timestamp_log(`[CHECK_PRESENCE]: ${err}`))
    .finally(() => {
      timestamp_log(`[CHECK_PRESENCE]: Next run in ${delay}ms`);
    });
  setTimeout(function () {
    check_presence({ delay, url, callbackLogic });
  }, delay);
}

module.exports = { check_presence };
