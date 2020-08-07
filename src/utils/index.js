module.exports = {
  getData: require("./scrape").getData,
  postData: require("./scrape").postData,
  getDataHttp: require("./scrape").getDataHttp,
  getPostOptions: require("./slack_utils").getPostOptions,
  round: require("./calculate").round,
  timestamp_log: require("./log").timestamp_log,
};
