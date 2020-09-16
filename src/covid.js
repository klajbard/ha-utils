"use strict";

const https = require("https");
const fs = require("fs")
const { JSDOM } = require("jsdom");
const { sendRequest, getPostOptions, timestampLog } = require("./utils");

function getsendRequest(data) {
  return JSON.stringify({
    icon_emoji: ":mask:",
    text: `*COVID*\nFertozottek: *${data.fertozott}*\nElhunytak: *${data.elhunyt}*\nGyogyultak: *${data.gyogyult}*`,
  });
}

function callback(res, logFile) {
  const dom = new JSDOM(res);
  const divAPI = dom.window.document.querySelector("#numbers-API");
  const fertozottPest = divAPI.querySelector("#api-fertozott-pest").innerHTML.replace(" ", "")
  const fertozottVidek = divAPI.querySelector("#api-fertozott-videk").innerHTML.replace(" ", "")
  const elhunytPest = divAPI.querySelector("#api-elhunyt-pest").innerHTML.replace(" ", "")
  const elhunytVidek = divAPI.querySelector("#api-elhunyt-videk").innerHTML.replace(" ", "")
  const gyogyultPest = divAPI.querySelector("#api-gyogyult-pest").innerHTML.replace(" ", "")
  const gyogyultVidek = divAPI.querySelector("#api-gyogyult-videk").innerHTML.replace(" ", "")
  const covidData = {
    fertozott: parseInt(fertozottPest) + parseInt(fertozottVidek),
    elhunyt: parseInt(elhunytPest) + parseInt(elhunytVidek),
    gyogyult: parseInt(gyogyultPest) + parseInt(gyogyultVidek)
  }
  if (!process.env.SLACK_SCRAPER) {
    timestampLog(`[COVID]: No Slack API given.`);
    timestampLog(`[COVID]: ${data}`);
    return;
  }
  fs.readFile(logFile, (err, data) => {
    if (err && err.code === "ENOENT") {
      fs.writeFileSync(logFile, "");
    } else if (err) {
      console.log(err);
    }
    timestampLog(`[COVID]: Checking if new data is posted`);
    if (!data || JSON.stringify(covidData) !== data.toString()) {
      console.log(covidData)
      console.log(data.toString())
      fs.writeFile(logFile, JSON.stringify(covidData), function (err) {
        if (err) {
          console.log(err);
        }
      });
      const req = https.request(getPostOptions("presence"), (res) => {
        console.log("[COVID]: statusCode:", res.statusCode);
      });

      const req2 = https.request(getPostOptions("nokia"), (res) => {
        console.log("[COVID]: statusCode:", res.statusCode);
      });
      req.on("error", (e) => {
        console.error(e);
      });
      req.write(getsendRequest(covidData));
      req.end();
      req2.on("error", (e) => {
        console.error(e);
      });
      req2.write(getsendRequest(covidData));
      req2.end();
    }
  });
}

function covid({delay, logFile}) {
  const options = {
    host: "koronavirus.gov.hu",
    method: "GET"
  }
  timestampLog('[COVID] Querying...')
  sendRequest(options)
    .then(res => callback(res, logFile))
    .catch((err) => timestampLog(`[COVID]: ${err}`))
    .finally(() => {
      timestampLog(`[COVID]: Next run in ${delay}ms`);
    });
  setTimeout(function () {
    covid({ delay, logFile });
  }, delay);
}

module.exports = { covid }