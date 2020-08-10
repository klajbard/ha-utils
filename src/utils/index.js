module.exports = {
  getData: require("./scrape").getData,
  postData: require("./scrape").postData,
  getDataHttp: require("./scrape").getDataHttp,
  postDataHttp: require("./scrape").postDataHttp,
  getPostOptions: require("./slack_utils").getPostOptions,
  round: require("./calculate").round,
  setState: require("./hass").setState,
  timestampLog: require("./log").timestampLog,
};
