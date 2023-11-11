import traceback
import dotenv
import flask
import json
import g4f
import os

DEFAULT_RESPONSES = json.loads(open(
    file="default_responses.json",
    mode="r",
    encoding="utf8"
    ).read())

class ServerApi:
    def __init__(self) -> None:
        self.app = flask.Flask(__name__)
        g4f.check_version = False 
    
        @self.app.route("/api", methods=["GET", "POST"])
        def repply_question() -> None:
            global DEFAULT_DEFAULT_RESPONSES
            try:
                question = flask.request.args.get("pergunta") if flask.request.method.upper() == "GET" \
                    else flask.request.get_json().get("pergunta")
                if not question:
                    return flask.jsonify(
                        resposta=DEFAULT_RESPONSES["!erro!"]
                    )
                
                if question.lower() in DEFAULT_RESPONSES.keys():
                    return flask.jsonify(
                        resposta=DEFAULT_RESPONSES[question.lower()]
                )
                response = g4f.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": "responda em portugues: " + question}],
                    stream=False
                )

                if isinstance(response, str):
                    return flask.jsonify(
                        resposta=response
                ), 200
                raise TypeError(response)
            except:
                traceback.print_exc()
                return flask.jsonify(
                    resposta=DEFAULT_RESPONSES["!erro!"]
                ), 500
if __name__ == "__main__":

    dotenv.load_dotenv()
    ServerApi().app.run(
        host=os.environ["FLASK_HOST"],
        port=os.environ["FLASK_PORT"],
        debug=os.environ["FLASK_DEBUG"] == "true"
    )
