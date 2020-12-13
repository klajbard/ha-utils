function appendZero(num) {
  return num < 10 ? `0${num}` : num;
}

function timestampLog(text) {
  const date = new Date();
  const formatted_date = `${date.getFullYear()}-${appendZero(
    date.getMonth() + 1
  )}-${appendZero(date.getDate())} ${appendZero(date.getHours())}:${appendZero(
    date.getMinutes()
  )}:${appendZero(date.getSeconds())}`;
  console.log(`\x1b[36m${formatted_date}\x1b[0m: ${text}`);
}

module.exports = timestampLog;
