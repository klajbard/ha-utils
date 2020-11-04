"use strict";

const https = require("https");
const fs = require("fs")
const { JSDOM } = require("jsdom");
const { sendRequest, getPostOptions, timestampLog } = require("./utils");

function getsendRequest(data, delta) {
  return JSON.stringify({
    icon_emoji: ":mask:",
    text: `*COVID*\n:biohazard_sign: *${data.fertozott}*\n:skull: *${data.elhunyt}*\n:heartpulse: *${data.gyogyult}*\n:chart_with_upwards_trend: *${delta}*`,
  });
}

function getSum(data) {
  return Object.values(data).reduce((sum, value) => {
    sum += value;
    return sum;
  }, 0);
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
    const fertozottekElozo = getSum(covidData)
    const fertozottekFriss = getSum(JSON.parse(data.toString()))
    const delta = Math.abs(fertozottekFriss - fertozottekElozo);
    if (!data || JSON.stringify(covidData) !== data.toString()) {
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
      req.write(getsendRequest(covidData, delta));
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
  sendRequest(options)
    .then(res => callback(res, logFile))
    .catch((err) => timestampLog(`[COVID]: ${err}`))
  setTimeout(function () {
    covid({ delay, logFile });
  }, delay);
}

module.exports = { covid }