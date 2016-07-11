'use strict'

const fs = require("fs");
const Telegram = require('telegram-node-bot');
const TelegramBaseController = Telegram.TelegramBaseController;
const tg = new Telegram.Telegram('220800675:AAH0PknzZmucD5Z2YBEfWMXTtv05DpEjyvU');
const RssFetcher = require('./weatherRssFeed.js');

 var data = fs.readFileSync("data.json");
 var jsonData = JSON.parse(data);
 var languages = [];
 var users = {};

 function AddUser(userID)
 {
   users[userID] = {};
   users[userID].languageCode = 'en';
   users[userID].subscribedChannels = [];
 }

 function IsUserExist(userID){
   if(!users[userID]){
     AddUser(userID);
   }
 }

function GetUserLanguage(userID){
  IsUserExist(userID);

  return users[userID].languageCode;
}

function SetUserLanauge(languageCode, userID){
    IsUserExist(userID);

    users[userID].languageCode = languageCode;
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

function GetLanguageList()
{
  if(languages.length === 0){
    for (var language in jsonData.language) {
      if (jsonData.language.hasOwnProperty(language)) {
        languages.push(language)
      }
    }
  }
  return languages;
}

function StartPolling(){
 setInterval(function(){
   jsonData.channels.forEach(function fetch(val) {
     RssFetcher.fetch(val);
   })
 }, 3000);
}

function IsChannelSubscribed(channel, userID) {
  IsUserExist(userID);
  var channelIndex = users[userID].subscribedChannels.indexOf(channel);
  if(channelIndex > -1){
    return true;
  }
  return false;
}

function SetSubscribeChannel(channel, userID) {
  IsUserExist(userID);

  if(!IsChannelSubscribed(channel, userID))
  {
    users[userID].subscribedChannels.push(channel);
  }
}

function DeleteSubscribeChannel(channel, userID) {
  IsUserExist(userID)

  if(IsChannelSubscribed(channel, userID)) {
    var channelIndex = users[userID].subscribedChannels.indexOf(channel)
    users[userID].subscribedChannels.splice(channelIndex,1);
  }
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

class SetLanguageController extends TelegramBaseController {
   /**
    * @param {Scope} $
    */
   handle($) {
     var languageCode = jsonData.language[$.query.language];
     if(languageCode) {
       SetUserLanauge(languageCode, $.update.message.from.id);
       //TODO: Add translation
       $.sendMessage("Language changed to: ", $.query.language);
     }
     else {
       $.sendMessage('Language "' + $.query.language + '" doesn\'t exist. WeatherHK now support Languages: ' + GetLanguageList().toString());
     }
   }
}

class SubscribeController extends TelegramBaseController {
   /**
    * @param {Scope} $
    */
   handle($) {
     var isTopicSupport = jsonData.topics.indexOf($.query.topic) > -1

     if(isTopicSupport) {
       SetSubscribeChannel($.query.topic, $.update.message.from.id);
       $.sendMessage("OK");
     }
     else {
       $.sendMessage('Subscribe Failed. Topic "' + $.query.topic + '" doesn\'t exist. WeatherHK now support topics: ' + jsonData.channels.toString());
     }
   }
}

class UnsubscribeController extends TelegramBaseController {
   /**
    * @param {Scope} $
    */
   handle($) {
     var isTopicSupport = jsonData.topics.indexOf($.query.topic) > -1

     if(isTopicSupport) {
       if(IsChannelSubscribed($.query.topic, $.update.message.from.id)){
         DeleteSubscribeChannel($.query.topic, $.update.message.from.id);
         $.sendMessage('unsubscribed');
       }
       else{
         $.sendMessage('UnSubscribe Failed. You didn\'t subscribe channel "' + $.query.topic +'" yet');
       }
     }
     else {
       $.sendMessage('UnSubscribe Failed. Topic "' + $.query.topic + '" doesn\'t exist. WeatherHK now support topics: ' + jsonData.channels.toString());
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
    .when('/language :language', new SetLanguageController())
    .when('/subscribe :topic', new SubscribeController())
    .when('/unsubscribe :topic', new UnsubscribeController())
    .otherwise(new InvalidInputController())
