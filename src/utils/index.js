module.exports = {
  sendRequest: require("./scrape").sendRequest,
  sendRequestHttp: require("./scrape").sendRequestHttp,
  getPostOptions: require("./slack_utils").getPostOptions,
  round: require("./calculate").round,
  setState: require("./hass").setState,
  timestampLog: require("./log").timestampLog,
  url2options: require("./url2options").url2options,
};
