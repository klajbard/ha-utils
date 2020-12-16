"use strict";

const https = require("https");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const getPostOptions = require("./utils/slack_utils");
const { sendRequest } = require("./utils/scrape");
const timestampLog = require("./utils/log");

function getsendRequest(newItems) {
  return JSON.stringify({
    text: newItems.reduce((acc, item) => {
      acc += `*${item.name} - ${item.price}*\n${item.url}\n`;
      return acc;
    }, ""),
  });
}

function getJofogasLink(name) {
  return `https://www.jofogas.hu/magyarorszag?f=p&q=${name}`;
}

function getHardveraprolink(name) {
  return `https://hardverapro.hu/aprok/keres.php?stext=${name}`;
}

const queryHardverapro = {
  count: ".list-unstyled li h3",
  item: ".media",
  titleLink: ".uad-title a",
  price: ".uad-price",
};

const queryJofogas = {
  item: ".general-item",
  titleLink: ".subject",
  price: ".price-value",
};

function callback(body, { logFile, query }) {
  const dom = new JSDOM(body);
  const itemsDOM = dom.window.document.querySelectorAll(query.item);
  if (!process.env.SLACK_PRESENCE) {
    timestampLog(`[ITEM_WATCHER]: No Slack API given.`);
    return;
  }
  fs.readFile(logFile, (err, data) => {
    if (err && err.code === "ENOENT") {
      fs.writeFileSync(logFile, "");
    } else if (err) {
      console.log(err);
    }
    const oldItems = data && data.toString() ? JSON.parse(data.toString()) : [];
    let newItems = [];
    itemsDOM.forEach((item) => {
      const nameDOM = item.querySelector(query.titleLink);
      const priceDOM = item.querySelector(query.price);
      if (!nameDOM || !priceDOM) return;
      const name = nameDOM.textContent.trim();
      const url = nameDOM.href.trim();
      const price = priceDOM.textContent.trim();
      if (!oldItems.length) {
        timestampLog(`[ITEM_WATCHER]: New item: ${name}.`);
        newItems.push({ name, url, price });
      } else {
        const isPresent = oldItems.find((oldItem) => {
          return oldItem.name === name || oldItem.price === price;
        });
        if (!isPresent) {
          newItems.push({ name, url, price });
        }
      }
    });
    if (newItems.length) {
      const text = JSON.stringify([...newItems, ...oldItems]);
      fs.writeFile(logFile, text, function (err) {
        if (err) {
          console.log(err);
        }
      });

      const req = https.request(getPostOptions("presence"), (res) => {
        console.log("[ITEM_WATCHER]: statusCode:", res.statusCode);
      });
      req.on("error", (e) => {
        console.error(e);
      });
      req.write(getsendRequest(newItems));
      req.end();
    }
  });
}

function item_watcher(config) {
  // timestampLog(`[ITEM_WATCHER]: Querying...`);
  if (!config.length) return;
  config.forEach(async (item) => {
    if (item.jofogas) {
      const urlJofogas = getJofogasLink(item.name);
      const body = await sendRequest(urlJofogas);
      callback(body, {
        logFile: `./log/${item.name}_jofogas`,
        query: queryJofogas,
      });
    }
    if (item.hardverapro) {
      const urlHardverapro = getHardveraprolink(item.name);
      const body = await sendRequest(urlHardverapro);
      callback(body, {
        logFile: `./log/${item.name}_hardverapro`,
        query: queryHardverapro,
      });
    }
  });
}

module.exports = item_watcher;
