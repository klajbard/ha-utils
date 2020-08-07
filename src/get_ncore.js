"use strict";

const JSDOM = require("jsdom").JSDOM;
const exec = require("child_process").exec;
const { getData, timestamp_log } = require("./utils");

function callback(body) {
  const dom = new JSDOM(body);
  const content = dom.window.document.querySelectorAll(".fobox_tartalom");
  const data = {};
  timestamp_log(`[NCORE]: Processing data...`);
  if (content.length) {
    const definitions = content[1].children[0].querySelectorAll(".dt");
    const values = content[1].children[0].querySelectorAll(".dd");
    for (let i = 0; i < Math.min(values.length, definitions.length); i++) {
      data[definitions[i].innerHTML] = values[i].innerHTML;
    }
  }
  timestamp_log(`[NCORE]: Output data...`);
  timestamp_log(`[NCORE]: ${JSON.stringify(data)}`);
}

function getRequestOptions(cookie) {
  return {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36",
      Cookie: `PHPSESSID=${cookie}`,
    },
  };
}

function get_ncore({ delay = 60000, user = { username: "", password: "" } }) {
  const command = `curl -F "nev=${user.username}" -F "pass=${user.password}" https://ncore.cc/login.php  -c - | grep -oP "(?<=PHPSESSID\\t).*?$" | tr -d "\\n"`;
  exec(command, (err, stdout, stderr) => {
    const cookie = stdout;
    if (err) return console.error(err);
    timestamp_log(`[NCORE]: Querying...`);
    getData("https://ncore.cc/hitnrun.php", getRequestOptions(cookie))
      .then(callback)
      .catch((err) => timestamp_log(`[NCORE]: ${err}`))
      .finally(() => {
        timestamp_log(`[NCORE]: Next run in ${delay}ms`);
      });
    setTimeout(function () {
      get_ncore({ delay, user });
    }, delay);
  });
}

module.exports = {
  get_ncore,
};
