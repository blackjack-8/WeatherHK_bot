'use strict'

const fs = require("fs");
const Telegram = require('telegram-node-bot');
const TelegramBaseController = Telegram.TelegramBaseController;
const tg = new Telegram.Telegram('220800675:AAH0PknzZmucD5Z2YBEfWMXTtv05DpEjyvU');
const RssFetcher = require('./weatherRssFeed.js');

 var data = fs.readFileSync("data.json");
 var jsonData = JSON.parse(data);
 var users = [];

 function AddUser(userID)
 {
   users[userID] = {};
   users[userID].languageCode = 'en';
 }

function GetUserLanguage(userID){
  if(users.indexOf(userID) === -1){
    AddUser(userID);
  }
  return users[userID].languageCode;
}

function GetChannel(topic, userID)
{
  var channel;
  var language = GetUserLanguage(userID);
   jsonData.channels.forEach(function fetch(val) {
     if(val.topic === topic && val.language === language){
      channel = val;
      return
    }
  });
  return channel
}

function StartPolling(){
 setTimeout(function(){
  jsonData.channels.forEach(function fetch(val) {
    RssFetcher.fetch(val);
  })}, 30);
}

StartPolling();

 class ListTopicController extends TelegramBaseController {
     /**
      * @param {Scope} $
      */
     handle($) {
         $.sendMessage(jsonData.topics.toString())
     }
 }

 class GetFeedController extends TelegramBaseController {
    /**
     * @param {Scope} $
     */
    handle($) {
      var isTopicSupport = jsonData.topics.indexOf($.query.topic) > -1

      if(isTopicSupport) {
        var channel = GetChannel($.query.topic, $.update.message.from.id);
        var content = RssFetcher.getFeed(channel)
        //TODO: Parse the html content into telegram message format
        $.sendMessage(content);
      }
      else {
        $.sendMessage('Topic "' + $.query.topic + '" doesn\'t exist. WeatherHK now support topics: ' + jsonData.channels.toString());
      }
    }
}

class InvalidInputController extends TelegramBaseController {
    handle($) {
        $.sendMessage('Invalid Input. WeatherHK have three commands: /topics, /tellme and /language. Try to enter it to check the details.')
    }
}

tg.router
    .when('/topics', new ListTopicController())
    .when('/tellme :topic', new GetFeedController())
    .otherwise(new InvalidInputController())
