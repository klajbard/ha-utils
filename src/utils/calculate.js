function round(number, decimals = 2) {
  return (
    Math.round((number + Number.EPSILON) * Math.pow(10, decimals)) /
    Math.pow(10, decimals)
  );
}

module.exports = {
  round,
};
