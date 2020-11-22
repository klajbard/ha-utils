"use strict";

const https = require("https");
const http = require("http");

function generateRequest(param, payload, protocol) {
  return new Promise((resolve, reject) => {
    const method = protocol === "http" ? http : https;
    const req = method.request(param, (res) => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", (data) => {
        body += data;
      });
      res.on("end", () => {
        resolve(body);
      });
      res.on("error", (error) => {
        reject(error);
      });
    });
    req.on("error", (err) => {
      reject(err);
    });
    payload && req.write(payload);
    req.end();
  });
}

function sendRequest(param, payload) {
  return generateRequest(param, payload);
}
function sendRequestHttp(param, payload) {
  return generateRequest(param, payload, "http");
}

module.exports = {
  sendRequest,
  sendRequestHttp,
};
