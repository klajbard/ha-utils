"use strict";

const https = require("https");
const { JSDOM } = require("jsdom");

const url2options = require("./utils/url2options");
const getPostOptions = require("./utils/slack_utils");
const timestampLog = require("./utils/log");
const { sendRequest } = require("./utils/scrape");

async function check_presence(url, callbackLogic) {
  // timestampLog(`[CHECK_PRESENCE]: Querying...`);
  const { host, path } = url2options(url);
  const options = {
    host,
    path,
    method: "GET",
  };
  const body = await sendRequest(options);
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
    req.write(JSON.stringify({ text: `Presence checker succeed: ${url} !` }));
    req.end();
  }
}

module.exports = check_presence;
