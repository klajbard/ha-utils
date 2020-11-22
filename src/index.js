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

const ncore_user = {
  username: process.env.NCORE_USERNAME,
  password: process.env.NCORE_PASSWORD,
};

const sg_session = process.env.SG_SESSID;

const fixer_api = process.env.FIXERAPI;

(function () {
  function callbackLogic(dom) {
    const elem = dom.window.document.querySelector(
      config.presence.queries[0].query
    );
    return elem && !!elem.children.length;
  }

  config.presence.allowed &&
    check_presence({
      delay: config.presence.delay,
      url: config.presence.queries[0].url,
      callbackLogic,
    });
  config.aws.allowed &&
    getAWSCost({ delay: config.aws.delay, logFile: config.aws.logFile });
  config.scraper.allowed &&
    scraper({
      delay: config.scraper.delay,
      ...config.scraper.queries[0],
    });
  config.ncore.allowed &&
    get_ncore({ delay: config.ncore.delay, user: ncore_user });
  config.dht.allowed &&
    readDht({ delay: config.dht.delay, pin: config.dht.pin });
  config.steamgifts.allowed &&
    steamgifts({ delay: config.steamgifts.delay, sessionId: sg_session });
  config.fixer.allowed &&
    fixer({
      delay: config.fixer.delay,
      api: fixer_api,
      base: config.fixer.base,
      target: config.fixer.target,
    });
  config.covid.allowed &&
    covid({ delay: config.covid.delay, logFile: config.covid.logFile });
  config.watcher.allowed &&
    watcher({ delay: config.watcher.delay, config: config.watcher.config });
})();
