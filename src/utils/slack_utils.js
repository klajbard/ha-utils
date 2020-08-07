const SLACK_API = {
  scraper: `/services/${process.env.SLACK_SCRAPER}`,
  presence: `/services/${process.env.SLACK_PRESENCE}`,
};

function getPostOptions(channel) {
  return {
    hostname: "hooks.slack.com",
    path: SLACK_API[channel],
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };
}

module.exports = {
  getPostOptions,
};
