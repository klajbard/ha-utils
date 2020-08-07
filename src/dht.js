const dht = require("node-dht-sensor").promises;
const { round, timestamp_log } = require("./utils");

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

function callback(res) {
  const { temperature: temp, humidity: hum } = res;
  timestamp_log(`[DHT]: ${round(temp)}°C ${round(hum)}%`);
}

function readDht({ delay = 10000, pin }) {
  readFromPin(pin)
    .then(callback)
    .catch((err) => timestamp_log(`[DHT]: ${err}`))
    .finally(() => timestamp_log(`[DHT]: Next run in ${delay}ms`));
  setTimeout(() => readDht({ delay, pin }), delay);
}

module.exports = {
  readDht,
};
