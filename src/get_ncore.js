"use strict";

const JSDOM = require("jsdom").JSDOM;
const exec = require("child_process").exec;
const { setState } = require("./utils/hass");
const { sendRequest } = require("./utils/scrape");
const timestampLog = require("./utils/log");

const ncore_user = {
  username: process.env.NCORE_USERNAME || "",
  password: process.env.NCORE_PASSWORD || "",
};

const mapHun = [
  "ncore_daily_rank",
  "ncore_weekly_rank",
  "ncore_monthly_rank",
  "ncore_last_month_rank",
  "ncore_allowed",
  "ncore_active",
  "ncore_hitnrun_possible",
  "ncore_hitnrun_month",
  "ncore_possible_hit_n_run",
];

const needed = ["ncore_possible_hit_n_run", "ncore_daily_rank", "ncore_active"];

function callback(body) {
  const dom = new JSDOM(body);
  const content = dom.window.document.querySelectorAll(".fobox_tartalom");
  const data = {};
  timestampLog(`[NCORE]: Processing data...`);
  if (content.length) {
    const definitions = content[1].children[0].querySelectorAll(".dt");
    const values = content[1].children[0].querySelectorAll(".dd");
    for (let i = 0; i < Math.min(values.length, definitions.length); i++) {
      data[mapHun[i]] = values[i].innerHTML;
      if (needed.indexOf(mapHun[i]) > -1) {
        const payload = {
          state: data[mapHun[i]],
          attributes: {
            friendly_name: definitions[i].innerHTML.slice(0, -1),
            icon: "mdi:server-network",
          },
        };
        setState({ sensor: `sensor.${mapHun[i]}`, payload });
      }
    }
  }
  timestampLog(`[NCORE]: Output data...`);
  timestampLog(`[NCORE]: ${JSON.stringify(data)}`);
}

function getRequestOptions(cookie) {
  return {
    host: "ncore.cc",
    path: "/hitnrun.php",
    method: "GET",
    headers: {
      "User-Agent": "curl/7.37.0",
      Cookie: `PHPSESSID=${cookie}`,
    },
  };
}

async function get_ncore() {
  const command = `curl -F "nev=${ncore_user.username}" -F "pass=${ncore_user.password}" https://ncore.cc/login.php  -c - | grep -oP "(?<=PHPSESSID\\t).*?$" | tr -d "\\n"`;
  exec(command, async (err, stdout, stderr) => {
    const cookie = stdout;
    if (err) return console.error(err);
    timestampLog(`[NCORE]: Querying...`);
    const body = await sendRequest(getRequestOptions(cookie));
    callback(body);
  });
}

module.exports = get_ncore;
