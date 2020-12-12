"use strict";

const { check_presence } = require("./check_presence");
const { getAWSCost } = require("./aws_cost");
const { scraper } = require("./post_scrape");
const { get_ncore } = require("./get_ncore");
const { readDht } = require("./dht");
const { steamgifts } = require("./steamgift");
const { fixer } = require("./fixer");
const { covid } = require("./covid");
const { watcher } = require("./watcher");
const config = require("./config.json");

const sg_session = process.env.SG_SESSID;
const fixer_api = process.env.FIXERAPI;
const ncore_user = {
  username: process.env.NCORE_USERNAME,
  password: process.env.NCORE_PASSWORD,
};

(async function () {
  const tick = 5000;

  async function delay() {
    return new Promise(function (resolve) {
      setTimeout(resolve, tick);
    });
  }

  async function execute(counter) {
    function shouldRun(delay) {
      return (counter * tick) % delay === 0;
    }

    function callbackLogic(dom) {
      const elem = dom.window.document.querySelector(
        config.presence.queries[0].query
      );
      return elem && !!elem.children.length;
    }

    shouldRun(config.presence.delay) &&
      config.presence.allowed &&
      check_presence(config.presence.queries[0].url, callbackLogic);

    shouldRun(config.aws.delay) &&
      config.aws.allowed &&
      getAWSCost(config.aws.logFile);

    shouldRun(config.scraper.delay) &&
      config.scraper.allowed &&
      scraper(
        config.scraper.queries[0].url,
        config.scraper.queries[0].query,
        config.scraper.queries[0].logFile
      );

    shouldRun(config.ncore.delay) &&
      config.ncore.allowed &&
      get_ncore(ncore_user);

    shouldRun(config.dht.delay) &&
      config.dht.allowed &&
      readDht(config.dht.pin);

    shouldRun(config.steamgifts.delay) &&
      config.steamgifts.allowed &&
      steamgifts(sg_session);

    shouldRun(config.fixer.delay) &&
      config.fixer.allowed &&
      fixer(fixer_api, config.fixer.base, config.fixer.target);

    shouldRun(config.covid.delay) &&
      config.covid.allowed &&
      covid(config.covid.logFile);

    shouldRun(config.watcher.delay) &&
      config.watcher.allowed &&
      watcher(config.watcher.config);
  }

  let counter = 0;
  while (true) {
    execute(counter);
    await delay(tick);
    counter++;
  }
})();
