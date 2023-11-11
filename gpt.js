const {OpenAI} = require("openai");
const { fetch } = require("openai/_shims/auto/types");
const fetchXHR = require("node-fetch")
const fs = require("fs");

/* carregar as respostas padrões */

const defaultResponse =  JSON.parse(fs.readFileSync("default_responses.json"));

// classe para gerar respostas

module.exports.GptGenerateResponse = class GptGenerateResponse{

    constructor (apiKey) {
        this.gpt =  new OpenAI({"apiKey": apiKey });
        this.token = apiKey;
    }

    // TODO: respostas geradas pelo API oficial
    // não tive tempo de testar então sim, está imcompleta

    async repply_question(question) {
        if (question.toLowerCase() in defaultResponse){
            return defaultResponse[question];
        }
        try {
            return this.gpt.completions.create(
                {
                    messages: [
                        {
                            role: 'user',
                            content:"me responda essa mensagem em portugues do brasil: " + question
                        }
                ],
                    model: 'text-davinci-003',
            }
        )
        } catch (error) {
            console.error(error);
            return defaultResponse["!erro!"];
        }
    }

    // usando o g4f para gerar as respostas, uma alternativa a API oficial

    async repply_question_by_g4f(question){
        let response = await fetchXHR(
            process.env.GF4_URL_API,{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({pergunta: question})
            }
        )
        let data =  await response.json()
        return data.resposta
    }
}                

// exportar a mensagem de erro padrão, esse valor será usado para identificar se a API retornou erro

exports = { defaultErrorMessage:defaultResponse["!erro!"] }