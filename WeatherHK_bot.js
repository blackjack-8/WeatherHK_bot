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
   users[userID].language = 'en';
 }

function GetUserLanguage(userID){
  if(users.indexOf(userID) === -1){
    AddUser(userID);
  }
  return users[userID].language;
}

function GetChannel(topic, language)
{
  var channel;
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
        var language = GetUserLanguage($.update.message.from.id);
        var channel = GetChannel($.query.topic, language);
        var content = RssFetcher.getFeed(channel)
        //TODO: Parse the html content into telegram message format
        $.sendMessage(content);
      }
      else {
        $.sendMessage('Topic "' + $.query.topic + '" doesn\'t exist')
      }
    }
}

class InvalidInputController extends TelegramBaseController {
    handle($) {
        $.sendMessage('Invalid Input')
    }
}

tg.router
    .when('/topics', new ListTopicController())
    .when('/tellme :topic', new GetFeedController())
    .otherwise(new InvalidInputController())
