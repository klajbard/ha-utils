const { sendRequestHttp, round, setState, timestampLog } = require("./utils");

function calculateCurrency(rates, baseList = [], target) {
  const isTargetValid =
    baseList.length > 0 &&
    baseList.filter(function (currency) {
      !rates.hasOwnProperty(currency);
    }).length === 0;
  let response = {};
  if (!isTargetValid || !rates.hasOwnProperty(target))
    return Promise.reject("Currency is not valid");
  baseList.forEach(function (targetCurrency) {
    response[targetCurrency] = round(rates[target] / rates[targetCurrency]);
    const payload = {
      state: response[targetCurrency],
      attributes: {
        friendly_name: targetCurrency,
        unit_of_measurement: target,
        icon: `mdi:currency-${targetCurrency.toLowerCase()}`,
      },
    };
    setState({ sensor: `sensor.${targetCurrency.toLowerCase()}`, payload });
  });
  return response;
}

function fixer({ delay = 60000, api = "", base, target }) {
  const options = {
    host: "data.fixer.io",
    path: `/api/latest?access_key=${api}&base=EUR`,
    method: "GET",
    headers: {
      "Content-type": "application/json",
    },
  };

  sendRequestHttp(options)
    .then(function (resp) {
      const respJSON = JSON.parse(resp);
      if (!respJSON.success) return Promise.reject(resp);
      const data = calculateCurrency(respJSON.rates, base, target);
      timestampLog(`[FIXER] ${JSON.stringify(data)}`);
    })
    .catch(function (err) {
      timestampLog(`[FIXER] ${err}`);
    })
    .finally(function () {
      setTimeout(function () {
        fixer({ delay, api, base, target });
      }, delay);
    });
}

module.exports = {
  fixer,
};
