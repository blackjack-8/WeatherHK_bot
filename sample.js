'use strict'

const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController
const tg = new Telegram.Telegram('220800675:AAH0PknzZmucD5Z2YBEfWMXTtv05DpEjyvU')

class TopicsController extends TelegramBaseController {
    /**
     * @param {Scope} $
     */
    topicsHandler($) {
        $.sendMessage('Topcis Data')
    }

    get routes() {
        return {
            'topics': 'topicsHandler'
        }
    }
}

tg.router
    .when(['topics'], new TopicsController())
