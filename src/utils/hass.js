const { sendRequestHttp } = require("./scrape")

const hass_api_url = "http://192.168.1.27:8123/api/states"
const hass_token = process.env.HASS_TOKEN
const headers = {
  "Authorization" : `Bearer ${hass_token}`,
  "Content-type": "application/json"
}

async function getState(sensor) {
  const options = {
    host: "192.168.1.27",
    port: 8123,
    path: `/api/states`,
    method: "GET",
    headers,
  }
  return await sendRequestHttp(options).then(function(resp) {
    if (resp.indexOf("401") === 0) return Promise.reject("Unauthorized")
    const response = JSON.parse(resp)
    const state = response.find((elem) => elem.entity_id === sensor)
    // const available_sensors = response.map((elem) => elem.entity_id)
    return state
  }).catch(err => {
    console.log(err)
  })
}

function setState({sensor, payload}) {
  const options = {
    host: "192.168.1.27",
    port: 8123,
    path: `/api/states/${sensor}`,
    method: "POST",
    headers,
  }
  return new Promise((resolve, reject) => {
      sendRequestHttp(options, JSON.stringify(payload)).then(function(resp) {
      if (resp.indexOf("401") === 0) return Promise.reject("Unauthorized")
      resolve(resp)
    }).catch(err => {
      reject(err)
    })
  })
}

module.exports = {
  setState
}