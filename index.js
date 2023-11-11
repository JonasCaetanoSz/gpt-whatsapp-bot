require("dotenv").config();
const {client, SendLog} = require("./lib")

// iniciando a aplicação

try {
    client.initialize()
} catch (error) {
    console.error(error);
    SendLog("erro desconhecido");
    SendLog(error)
}