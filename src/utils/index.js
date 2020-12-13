module.exports = {
  sendRequest: require("./scrape").sendRequest,
  execShellCommand: require("./exec_shell"),
  sendRequestHttp: require("./scrape").sendRequestHttp,
  getPostOptions: require("./slack_utils"),
  round: require("./calculate"),
  getState: require("./hass").getState,
  setState: require("./hass").setState,
  timestampLog: require("./log"),
  url2options: require("./url2options"),
};
