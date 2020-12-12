const dht = require("node-dht-sensor").promises;
const { round, setState, timestampLog } = require("./utils");

function readFromPin(pin) {
  dht.setMaxRetries(5);
  dht.initialize(22, pin);
  return new Promise((resolve, reject) => {
    dht
      .read(22, pin)
      .then((value) => resolve(value))
      .catch((err) => reject(err));
  });
}

async function readDht(pin) {
  timestampLog(`[DHT]: Querying...`);
  const res = await readFromPin(pin);
  const { temperature, humidity } = res;
  const payloadTemp = {
    state: round(temperature),
    attributes: {
      friendly_name: "RPI DHT temperature",
      unit_of_measurement: "°C",
      device_class: "temperature",
    },
  };
  const payloadHum = {
    state: round(humidity),
    attributes: {
      friendly_name: "RPI DHT humidity",
      unit_of_measurement: "%",
      device_class: "humidity",
    },
  };
  setState({ sensor: "sensor.rpi_temperature", payload: payloadTemp });
  setState({ sensor: "sensor.rpi_humidity", payload: payloadHum });
  timestampLog(`[DHT]: ${round(temperature)}°C ${round(humidity)}%`);
}

module.exports = {
  readDht,
};
