"use strict";

const https = require("https");
const { JSDOM } = require("jsdom");
const {
  sendRequest,
  getPostOptions,
  timestampLog,
  url2options,
} = require("./utils");

function callback(url, callbackLogic) {
  return function (body) {
    function getsendRequest() {
      return JSON.stringify({
        text: `Presence checker succeed: ${url} !`,
      });
    }

    const dom = new JSDOM(body);
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
      req.write(getsendRequest());
      req.end();
    }
  };
}

function check_presence({ delay = 60000, url, callbackLogic }) {
  const { host, path } = url2options(url);
  const options = {
    host,
    path,
    method: "GET",
  };
  sendRequest(options)
    .then(callback(url, callbackLogic))
    .catch((err) => timestampLog(`[CHECK_PRESENCE]: ${err}`))
    .finally(() => {
    });
  setTimeout(function () {
    check_presence({ delay, url, callbackLogic });
  }, delay);
}

module.exports = { check_presence };
