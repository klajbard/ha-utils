"use strict";

const https = require("https");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const {
  sendRequest,
  getPostOptions,
  timestampLog,
  url2options,
} = require("./utils");

function getsendRequest(data, url) {
  return JSON.stringify({
    text: `*${data}*\n${url}`,
  });
}

function callback(body, { url, query, logFile }) {
  const dom = new JSDOM(body);
  const text = dom.window.document.querySelector(query).innerHTML;
  if (!process.env.SLACK_SCRAPER) {
    timestampLog(`[POST_SCRAPE]: No Slack API given.`);
    timestampLog(`[POST_SCRAPE]: ${text}`);
    return;
  }
  fs.readFile(logFile, (err, data) => {
    if (err && err.code === "ENOENT") {
      fs.writeFileSync(logFile, "");
    } else if (err) {
      console.log(err);
    }
    timestampLog(`[POST_SCRAPE]: Checking if new data is posted`);
    if (!data || text !== data.toString()) {
      fs.writeFile(logFile, text, function (err) {
        if (err) {
          console.log(err);
        }
      });
      const req = https.request(getPostOptions("scraper"), (res) => {
        console.log("[POST_SCRAPE]: statusCode:", res.statusCode);
      });
      req.on("error", (e) => {
        console.error(e);
      });
      req.write(getsendRequest(text, url));
      req.end();
    }
  });
}

function scraper({ delay = 60000, url, query, logFile }) {
  timestampLog(`[POST_SCRAPE]: Querying...`);
  const { host, path } = url2options(url);
  const options = {
    host,
    path,
    method: "GET",
  };
  sendRequest(options)
    .then((body) => callback(body, { url, query, logFile }))
    .catch((err) => console.log(err))
    .finally(() => {
      timestampLog(`[POST_SCRAPE]: Next run in ${delay}ms`);
    });
  setTimeout(function () {
    scraper({ delay, url, query, logFile });
  }, delay);
}

module.exports = {
  scraper,
};
