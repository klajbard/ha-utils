"use strict";

const https = require("https");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const { getData, getPostOptions, timestamp_log } = require("./utils");

function getPostData(data, url) {
  return JSON.stringify({
    text: `*${data}*\n${url}`,
  });
}

function callback(body, { url, query, logFile }) {
  const dom = new JSDOM(body);
  const text = dom.window.document.querySelector(query).innerHTML;
  if (!process.env.SLACK_SCRAPER) {
    timestamp_log(`[POST_SCRAPE]: No Slack API given.`);
    timestamp_log(`[POST_SCRAPE]: ${text}`);
    return;
  }
  fs.readFile(logFile, (err, data) => {
    if (err && err.code === "ENOENT") {
      fs.writeFileSync(logFile, "");
    } else if (err) {
      console.log(err);
    }
    timestamp_log(`[POST_SCRAPE]: Checking if new data is posted`);
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
      req.write(getPostData(text, url));
      req.end();
    }
  });
}

function scraper({ delay = 60000, url, query, logFile }) {
  timestamp_log(`[POST_SCRAPE]: Querying...`);
  getData(url)
    .then((body) => callback(body, { url, query, logFile }))
    .catch((err) => console.log(err))
    .finally(() => {
      timestamp_log(`[POST_SCRAPE]: Next run in ${delay}ms`);
    });
  setTimeout(function () {
    scraper({ delay, url, query, logFile });
  }, delay);
}

module.exports = {
  scraper,
};
