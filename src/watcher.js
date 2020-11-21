"use strict";

const https = require("https");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const { sendRequest, getPostOptions, timestampLog } = require("./utils");

function getsendRequest(newItems) {
  return JSON.stringify({
    text: newItems.reduce((acc, item) => {
      acc += `*${item.name} - ${item.price}*\n${item.url}\n`
      return acc;
    }, "")
  })
}

function getJofogasLink(name) {
  return `https://www.jofogas.hu/magyarorszag?f=p&q=${name}`;
}

function getHardveraprolink(name) {
  return `https://hardverapro.hu/aprok/keres.php?stext=${name}`
}

const queryHardverapro = {
  count: ".list-unstyled li h3",
  item: ".media",
  titleLink: ".uad-title a",
  price: ".uad-price"
}

const queryJofogas = {
  item: ".general-item",
  titleLink: ".subject",
  price: ".price-value"
}

function callback(body, { logFile, query }) {
  const dom = new JSDOM(body);
  const itemsDOM = dom.window.document.querySelectorAll(query.item);
  if (!process.env.SLACK_PRESENCE) {
    timestampLog(`[WATCHER]: No Slack API given.`);
    return;
  }
  fs.readFile(logFile, (err, data) => {
    if (err && err.code === "ENOENT") {
      fs.writeFileSync(logFile, "");
    } else if (err) {
      console.log(err);
    }
    timestampLog(`[WATCHER]: Checking if new data is posted`);
    const oldItems = data && data.toString() ? JSON.parse(data.toString()) : [];
    let newItems = []
    itemsDOM.forEach((item) => {
      const nameDOM = item.querySelector(query.titleLink)
      const name = nameDOM.textContent.trim()
      const url = nameDOM.href.trim()
      const price = item.querySelector(query.price).textContent.trim()
      if (!oldItems.length) {
        timestampLog(`[WATCHER]: New item: ${name}.`);
        newItems.push({name, url, price})
      } else {
        oldItems.forEach((oldItem) => {
          if (oldItem.name === item.name && oldItem.price === item.price) {
            newItems.push({name, url, price})
          }
        })
      }
    })
    if (newItems.length) {
      const text = JSON.stringify([...newItems, ...oldItems])
      fs.writeFile(logFile, text, function (err) {
        if (err) {
          console.log(err);
        }
      });

      const req = https.request(getPostOptions("presence"), (res) => {
        console.log("[WATCHER]: statusCode:", res.statusCode);
      });
      req.on("error", (e) => {
        console.error(e);
      });
      req.write(getsendRequest(newItems));
      req.end();
    }
  });
}

function watcher({ delay = 60000, config }) {
  timestampLog(`[WATCHER]: Querying...`);
  if (!config.length) return;
  config.forEach(item => {
    if(item.jofogas) {
      const urlJofogas = getJofogasLink(item.name)
      sendRequest(urlJofogas)
        .then((body) => callback(body, { logFile: `./log/${item.name}_jofogas`, query: queryJofogas }))
        .catch((err) => console.log(err))
    }
    if(item.hardverapro) {
      const urlHardverapro = getHardveraprolink(item.name)
      sendRequest(urlHardverapro)
        .then((body) => callback(body, { logFile: `./log/${item.name}_hardverapro`, query: queryHardverapro }))
        .catch((err) => console.log(err))
    }
    
    setTimeout(function () {
      watcher({ delay, config });
    }, delay);
  });
}

module.exports = {
  watcher,
};
