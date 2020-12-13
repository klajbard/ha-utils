const { sendRequestHttp } = require("./scrape");

const hass_ip = process.env.HASS_IP;
const hass_token = process.env.HASS_TOKEN;
const headers = {
  Authorization: `Bearer ${hass_token}`,
  "Content-type": "application/json",
};

const [host, port] = hass_ip.split(":");

async function getState(sensor) {
  const options = {
    host,
    port,
    path: `/api/states`,
    method: "GET",
    headers,
  };
  return new Promise((resolve, reject) => {
    sendRequestHttp(options, JSON.stringify(payload))
      .then(function (resp) {
        if (resp.indexOf("401") === 0) return reject("Unauthorized");
        const response = JSON.parse(resp);
        const state = response.find((elem) => elem.entity_id === sensor);
        resolve(state);
      })
      .catch(reject);
  });
}

function setState({ sensor, payload }) {
  const options = {
    host,
    port,
    path: `/api/states/${sensor}`,
    method: "POST",
    headers,
  };
  return new Promise((resolve, reject) => {
    sendRequestHttp(options, JSON.stringify(payload))
      .then(function (resp) {
        if (resp.indexOf("401") === 0) return Promise.reject("Unauthorized");
        resolve(resp);
      })
      .catch(reject);
  });
}

module.exports = {
  getState,
  setState,
};
