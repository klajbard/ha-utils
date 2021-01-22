"use strict";

const bump_hvapro = require("./bump_hvapro");
const check_presence = require("./check_presence");
const get_aws_cost = require("./get_aws_cost");
const get_ncore = require("./get_ncore");
const read_dht = require("./dht");
const run_covid = require("./covid");
const run_fixer = require("./fixer");
const run_item_watcher = require("./item_watcher");
const run_post_watcher = require("./post_watcher");
const run_steamgifts = require("./steamgift");
const config = require("./config.json");

(async function () {
  const {
    tick,
    aws_cost,
    hvapro_bump,
    covid,
    dht,
    fixer,
    ncore,
    presence,
    post_watcher,
    steamgifts,
    item_watcher,
  } = config;

  async function delay() {
    return new Promise(function (resolve) {
      setTimeout(resolve, tick);
    });
  }

  function callbackLogic(dom) {
    return parseInt(dom.window.document.getElementById("quantityAvailable").textContent);
  }

  async function execute(counter) {
    function shouldRun(delay) {
      return (counter * tick) % delay === 0;
    }

    shouldRun(presence.delay) &&
      presence.allowed &&
      check_presence(presence.queries[0].url, callbackLogic);

    shouldRun(aws_cost.delay) &&
      aws_cost.allowed &&
      get_aws_cost(aws_cost.logFile);

    shouldRun(post_watcher.delay) &&
      post_watcher.allowed &&
      run_post_watcher(
        post_watcher.queries[0].url,
        post_watcher.queries[0].query,
        post_watcher.queries[0].logFile
      );

    shouldRun(ncore.delay) && ncore.allowed && get_ncore();

    shouldRun(dht.delay) && dht.allowed && read_dht(dht.pin);

    shouldRun(steamgifts.delay) && steamgifts.allowed && run_steamgifts();

    shouldRun(fixer.delay) &&
      fixer.allowed &&
      run_fixer(fixer.base, fixer.target);

    shouldRun(covid.delay) && covid.allowed && run_covid(covid.logFile);

    shouldRun(item_watcher.delay) &&
      item_watcher.allowed &&
      run_item_watcher(item_watcher.config);

    shouldRun(hvapro_bump.delay) &&
      hvapro_bump.allowed &&
      bump_hvapro(
        hvapro_bump.items[0].name,
        hvapro_bump.items[0].fidentifier,
        hvapro_bump.items[0].delay
      );
  }

  let counter = 0;
  while (true) {
    execute(counter);
    await delay(tick);
    counter++;
  }
})();
