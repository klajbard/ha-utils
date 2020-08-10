const { getData, timestampLog, postData } = require("./utils");

function join_recent(sessionId) {
  const cookie = `PHPSESSID=${sessionId}`;
  const url = "https://www.steamgifts.com";

  const get_options = {
    method: "GET",
    headers: {
      Cookie: cookie,
      referer: "www.steamgifts.com",
    },
  };

  getData(url, get_options).then((resp) => {
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
    postData(post_options, payloadString).then((resp) => {
      timestampLog(`[SG]: ${resp}`);
    });
  });
}

function steamgifts({ delay = 60000, sessionId = "" }) {
  join_recent(sessionId);
  timestampLog(`[SG]: Next run in ${delay}ms`);
  setTimeout(function () {
    steamgifts({ delay, sessionId });
  }, delay);
}

module.exports = {
  steamgifts,
};
