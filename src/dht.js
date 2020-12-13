const dht = require("node-dht-sensor").promises;
const { round, setState, timestampLog } = require("./utils");

function setTemperature(temp) {
  const payloadTemp = {
    state: round(temp),
    attributes: {
      friendly_name: "RPI DHT temperature",
      unit_of_measurement: "°C",
      device_class: "temperature",
    },
  };
  setState({ sensor: "sensor.rpi_temperature", payload: payloadTemp });
}

function setHumidity(hum) {
  const payloadHum = {
    state: round(hum),
    attributes: {
      friendly_name: "RPI DHT humidity",
      unit_of_measurement: "%",
      device_class: "humidity",
    },
  };
  setState({ sensor: "sensor.rpi_humidity", payload: payloadHum });
}

function readFromPin(pin) {
  return new Promise((resolve, reject) => {
    dht.setMaxRetries(5);
    if (!dht.initialize(22, pin)) {
      reject("Couldn't initialize DHT sensor.");
    }
    dht
      .read(22, pin)
      .then((value) => resolve(value))
      .catch(reject);
  });
}

function readDht(pin) {
  timestampLog(`[DHT]: Querying...`);
  readFromPin(pin)
    .then(async function (res) {
      const { temperature, humidity } = res;
      await setHumidity(humidity);
      await setTemperature(temperature);
      timestampLog(`[DHT]: ${round(temperature)}°C ${round(humidity)}%`);
    })
    .catch(console.error);
}

module.exports = {
  readDht,
};
