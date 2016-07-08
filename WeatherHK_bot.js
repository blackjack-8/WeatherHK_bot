'use strict'

const Telegram = require('telegram-node-bot');
const TelegramBaseController = Telegram.TelegramBaseController;
const tg = new Telegram.Telegram('220800675:AAH0PknzZmucD5Z2YBEfWMXTtv05DpEjyvU');

class EchoController extends TelegramBaseController {
    /**
     * @param {Scope} $
     */
    pingHandler($) {
        $.sendMessage('pong')
    }

    get routes() {
        return {
            'ping': 'pingHandler'
        }
    }
}

class InvalidInputController extends TelegramBaseController {
    handle($) {
        $.sendMessage('Invalid Input')
    }
}

tg.router
    .when(['ping'], new EchoController())
    .otherwise(new InvalidInputController())
