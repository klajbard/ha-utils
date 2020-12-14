"use strict";

const bump_hvapro = require("./bump_hvapro");
const check_presence = require("./check_presence");
const get_aws_cost = require("./aws_cost");
const scraper = require("./post_scrape");
const get_ncore = require("./get_ncore");
const read_dht = require("./dht");
const steamgifts = require("./steamgift");
const fixer = require("./fixer");
const covid = require("./covid");
const watcher = require("./watcher");
const config = require("./config.json");

(async function () {
  const tick = 5000;

  async function delay() {
    return new Promise(function (resolve) {
      setTimeout(resolve, tick);
    });
  }

  function callbackLogic(dom) {
    const elem = dom.window.document.querySelector(
      config.presence.queries[0].query
    );
    return elem && !!elem.children.length;
  }

  async function execute(counter) {
    function shouldRun(delay) {
      return (counter * tick) % delay === 0;
    }

    shouldRun(config.presence.delay) &&
      config.presence.allowed &&
      check_presence(config.presence.queries[0].url, callbackLogic);

    shouldRun(config.aws.delay) &&
      config.aws.allowed &&
      get_aws_cost(config.aws.logFile);

    shouldRun(config.scraper.delay) &&
      config.scraper.allowed &&
      scraper(
        config.scraper.queries[0].url,
        config.scraper.queries[0].query,
        config.scraper.queries[0].logFile
      );

    shouldRun(config.ncore.delay) && config.ncore.allowed && get_ncore();

    shouldRun(config.dht.delay) &&
      config.dht.allowed &&
      read_dht(config.dht.pin);

    shouldRun(config.steamgifts.delay) &&
      config.steamgifts.allowed &&
      steamgifts();

    shouldRun(config.fixer.delay) &&
      config.fixer.allowed &&
      fixer(config.fixer.base, config.fixer.target);

    shouldRun(config.covid.delay) &&
      config.covid.allowed &&
      covid(config.covid.logFile);

    shouldRun(config.watcher.delay) &&
      config.watcher.allowed &&
      watcher(config.watcher.config);

    shouldRun(config.hvapro.delay) &&
      config.hvapro.allowed &&
      bump_hvapro(
        config.hvapro.items[0].name,
        config.hvapro.items[0].fidentifier,
        config.hvapro.items[0].delay
      );
  }

  let counter = 0;
  while (true) {
    execute(counter);
    await delay(tick);
    counter++;
  }
})();
