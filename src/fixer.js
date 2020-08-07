const { getDataHttp, round, timestamp_log } = require("./utils");

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
  });
  return response;
}

function fixer({ delay = 60000, api = "", base, target }) {
  const url = `http://data.fixer.io/api/latest?access_key=${api}&base=EUR`;
  getDataHttp(url)
    .then(function (resp) {
      const respJSON = JSON.parse(resp);
      if (!respJSON.success) return Promise.reject(resp);
      const data = calculateCurrency(respJSON.rates, base, target);
      timestamp_log(`[FIXER] ${JSON.stringify(data)}`);
    })
    .catch(function (err) {
      timestamp_log(`[FIXER] ${err}`);
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
