"use strict";

const https = require("https");
const { JSDOM } = require("jsdom");
const { sendRequest } = require("./utils/scrape");
const timestampLog = require("./utils/log");

const identifier = process.env.HVA_ID || "";

async function bump_hvapro(prod_name, fidentifier, bump_interval) {
  timestampLog(`[HVAPRO_BUMP]: Querying...`);
  const url = `https://hardverapro.hu/apro/${prod_name}/hsz_1-50.html`;
  const body = await sendRequest(url);
  const dom = new JSDOM(body);
  const lastUpDOM = dom.window.document.querySelector(
    `[title="Utolsó UP dátuma"]`
  );
  if (!lastUpDOM || !lastUpDOM.textContent.includes("órája")) return;
  const lastUp = parseInt(lastUpDOM.textContent);
  if (lastUp < bump_interval) return;
  const regex = /(?<=uadid=)\d+/gi;
  const pid = body.match(regex)[0];

  const content = `fidentifier=${fidentifier}`;

  const get_options = {
    host: "hardverapro.hu",
    path: `/muvelet/apro/felhoz.php?id=${pid}`,
    method: "POST",
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      Cookie: `identifier=${identifier}`,
    },
  };

  const req = https.request(get_options, (res) => {
    timestampLog(`[HVAPRO_BUMP]: statusCode: ${res.statusCode}`);
  });
  req.on("error", console.error);
  req.write(content);
  req.end();
}

module.exports = bump_hvapro;
