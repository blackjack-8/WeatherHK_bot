
const fs = require("fs");
const RssFetcher = require('./weatherRssFeed.js');

 var data = fs.readFileSync("data.json");
 var jsonData = JSON.parse(data);

  RssFetcher.fetch(jsonData.channels[0]);
