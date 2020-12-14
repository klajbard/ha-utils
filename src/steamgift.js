const { sendRequest } = require("./utils/scrape");
const timestampLog = require("./utils/log");

const sessionId = process.env.SG_SESSID;

function steamgifts() {
  timestampLog(`[SG]: Querying...`);
  const cookie = `PHPSESSID=${sessionId}`;

  const get_options = {
    host: "www.steamgifts.com",
    method: "GET",
    headers: {
      Cookie: cookie,
      referer: "www.steamgifts.com",
    },
  };

  sendRequest(get_options).then((resp) => {
    const giveaway_url = resp
      .replace(/^\r\n+/gm, "")
      .replace(/^\s+/gm, "")
      .replace(/<!DOCTYPE html>[\s\S]*featured__inner-wrap">\r<a href="/g, "")
      .replace(/" class="[\s\S]*<\/html>/g, "");
    const giveaway_id = giveaway_url.match(/\/giveaway\/(.{5})\/.*/)[1];
    const xsrf_token =
      resp.match(/<input type="hidden" name="xsrf_token" value="(.*)" \/>/) ||
      [];
    const payloadString = `xsrf_token=${xsrf_token[1]}&do=entry_insert&code=${giveaway_id}`;
    const post_options = {
      host: "www.steamgifts.com",
      path: "/ajax.php",
      method: "POST",
      headers: {
        Cookie: cookie,
        referer: `https://www.steamgifts.com${giveaway_url}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Content-Length": payloadString.length,
      },
    };
    sendRequest(post_options, payloadString).then((resp) => {
      timestampLog(`[SG]: ${resp}`);
    });
  });
}

module.exports = steamgifts;
