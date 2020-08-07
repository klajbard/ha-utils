## Home Automation Utils
- Configuration for each utils are inside `src/config.json`

### AWS Cost
Get current month AWS cost from `aws2` CLI and log to a file.

Once the file last modification is older than the given delay it will query once again for the current price.
> Querying costs `0.01$`

#### Example config
```json
"aws": {
  "allowed": true,
  "delay": 43200000,
  "logFile": "./log/awscost"
},
```

### DHT
Reads DHT sensor from the given data pin and in a given interval and logs the output.

#### Example config
```json
"dht": {
  "allowed": true,
  "delay": 5000,
  "pin": 22
},
```

### Currency Exchanger(fixer.io)
Converts from an array of currencies as bases to target currency.
API key is used from env variables.
```sh
export FIXERAPI="abcdefghijklmnopqrstuvwxyz0123456789"
```
#### Example config
```json
"fixer": {
  "allowed": true,
  "delay": 5000,
  "base": ["EUR", "USD", "CHF"],
  "target": "HUF"
},
```

### nCore status
Get current available statistics from nCore and logs the output.
Credentials are used from env variables.
```sh
export NCORE_USERNAME="username"
export NCORE_PASSWORD="password"
```

#### Example config
```json
"ncore": {
  "allowed": true,
  "delay": 7200000
},
```

### Check Presence
Queries the given url in a given interval and check if the content changed based on the given selector (`query`). If the content changes, gives a notification on Slack.
> It is possible to provide multiple entries.
Slack service API is from env variable without the `/services/` prefix.
```sh
export SLACK_SCRAPER="ABCDEFGHI/JKLMNOPQRST/uvwxyz0123456789abcdefgh"
export SLACK_PRESENCE="ABCDEFGHI/JKLMNOPQRST/uvwxyz0123456789abcdefgh"
```
#### Example config
```json
"presence": {
  "allowed": true,
  "delay": 5000,
  "queries": [
    {
      "url": "https://urltoquery.com/endpoint",
      "query": "#content"
    }
  ]
},
```

### Post checker
Queries the given url and stores the content of the given selector(`query`). If the content changes, gives a notification on Slack.
> It is possible to provide multiple entries.

#### Example config
```json
"scraper": {
  "allowed": true,
  "delay": 14400000,
  "queries": [
    {
      "url": "https://urltoquery.com/endpoint",
      "query": "#content",
      "logFile": "./log/query_state"
    }
  ]
}
```

### Steamgift
Enters the giveaway which will close most recently.
Session id key is used from env variables.
```sh
export SG_SESSID="abcdefghijklmnopqrstuvwxyz0123456789"
```
#### Example config
```json
"steamgifts": {
  "allowed": true,
  "delay": 300000
}
```