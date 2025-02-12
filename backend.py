from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from interpreter import interpreter

app = Flask(__name__)

CORS(app)

os.environ["OPENAI_API_KEY"] = "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"

from interpreter import interpreter

# interpreter.offline = True # Disables online features like Open Procedures
# interpreter.llm.model = "openai/x" # Tells OI to send messages in OpenAI's format
# interpreter.llm.api_key = "x" # LiteLLM, which we use to talk to LM Studio, requires this
# interpreter.llm.api_base = "http://localhost:1234/v1" # Point this at any OpenAI compatible server


@app.route('/chat', methods=['POST'])
def chat():
    # Get user input from the POST request
    user_input = request.json.get("message", "")
    
    if not user_input:
        return jsonify({"error": "Message is required"}), 400
    
    response = ""
    try:
        for chunk in interpreter.chat(user_input, stream=True, display=False):
            if "content" in chunk:
                response += chunk["content"]
        interpreter.messages = []
        return jsonify({"response": response}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
