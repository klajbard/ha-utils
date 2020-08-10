"use strict";

const https = require("https");
const http = require("http");

function getDataHttp(url, param = {}) {
  return new Promise((resolve, reject) => {
    http.get(url, param, (res) => {
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
  });
}

function getData(url, param = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, param, (res) => {
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
  });
}

function postData(param, payload) {
  return new Promise((resolve, reject) => {
    const req = https.request(param, (res) => {
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
    req.write(payload);
    req.end();
  });
}

function postDataHttp(param, payload) {
  return new Promise((resolve, reject) => {
    const req = http.request(param, (res) => {
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
    req.write(payload);
    req.end();
  });
}

module.exports = {
  getData,
  getDataHttp,
  postData,
  postDataHttp,
};
