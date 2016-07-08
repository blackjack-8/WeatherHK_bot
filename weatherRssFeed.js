var request = require('request')
  , FeedParser = require('feedparser');

function fetch(feed) {
  // Define our streams
  var req = request(feed);

  var feedparser = new FeedParser();

  // Define our handlers
  req.on('error', done);
  req.on('response', function (res) {
    var stream = this;
    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

    stream.pipe(feedparser);
  });

  feedparser.on('error', done);
  feedparser.on('end', done);
  feedparser.on('readable', function() {
    var result;
    while (result = this.read()) {
      console.log(JSON.stringify(result, ' ', 4));
    }
  });
}

function done(err) {
  if (err) {
    console.log(err, err.stack);
    return process.exit(1);
  }
  process.exit();
}

fetch("http://rss.weather.gov.hk/rss/CurrentWeather_uc.xml");
