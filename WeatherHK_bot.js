'use strict'

const fs = require("fs");
const Telegram = require('telegram-node-bot');
const TelegramBaseController = Telegram.TelegramBaseController;
const tg = new Telegram.Telegram('220800675:AAH0PknzZmucD5Z2YBEfWMXTtv05DpEjyvU');


 var data = fs.readFileSync("data.json");
 var jsonData = JSON.parse(data);

 class ListTopicController extends TelegramBaseController {
     /**
      * @param {Scope} $
      */
     handle($) {
         $.sendMessage(jsonData.topics.toString())
     }
 }


class InvalidInputController extends TelegramBaseController {
    handle($) {
        $.sendMessage('Invalid Input')
    }
}

tg.router
    .when('/topics', new ListTopicController())
    .otherwise(new InvalidInputController())
