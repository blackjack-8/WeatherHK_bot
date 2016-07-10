
var FeedParser = require('feedparser')
  , request = require('request');

var data = {};
function done(err) {
  if (err) {
    console.log(err, err.stack);
  }
}
module.exports = {

 fetch : function(feed) {
  // Define our streams
  var req = request(feed.rssLink);
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
      data[feed.code] = result
    }
  });
},

 getFeed : function(channel){
   var content = data[channel.code];
   return content.description;
 }
}
