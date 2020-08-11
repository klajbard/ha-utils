function url2options(url) {
  const regex = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/
  const match = url.match(regex)
  return {host: match[4], path: match[5]}
}

module.exports = {
  url2options
}