const { Client, LocalAuth } = require('whatsapp-web.js');
const TelegramBot = require('node-telegram-bot-api');
const qrcode = require("qrcode-terminal");
const { model } = require('mongoose');
const {GptGenerateResponse, defaultErrorMessage} = require("./gpt");

// instanciando  a classe GPT

const Gpt = new GptGenerateResponse(process.env.OPENAI_API_KEY);

const client = new Client({
    authStrategy: new LocalAuth({
      clientId: "client",
      dataPath:  "session/client"
    }),
    puppeteer: {
      headless: process.env.HIDDEN_BROWSER,
    }
  });

//client.initialize()

// enviar logs ao desenvolvedor

function SendLog(event){
    let bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN , {polling: false});
    bot.sendMessage(process.env.ADMIN_CHAT_ID,event);
    bot.close();
}

// exibir o qr code para escanear

client.on("qr", (qr) => {
    console.log("ESCANEIA O QRCODE PARA FAZER LOGIN:");
    qrcode.generate(qr, {small:true})
})

// login feito e escutando eventos

client.on('authenticated', (session) => {
    console.log('WHATSAPP WEB => Authenticated');
  });
  
  client.on("ready", async () => {
    console.log("WHATSAPP WEB => Ready");
  });

// ler mensagens e responder

client.on("message", message => {
    let query = message.body;
    console.log("nova mensagem recebida: "  + query);

    if(process.env.USE_OFFCIAL_API === true){

      let text = Gpt.repply_question(query);
      message.reply(text);
      if (text === defaultErrorMessage){
        SendLog("erro desconhecido na API oficial, verifique o log do servidor para saber mais detalhes.");
      }
      return null
    }

    Gpt.repply_question_by_g4f(query).then(text => {
        message.reply(text);
    })

});

// notificar ao desenvolvedor que a conta foi desconectada

client.on("disconnected", wevent => {
SendLog("serviço do whatssapp foi desconectado.")
});

module.exports = {client, SendLog};  