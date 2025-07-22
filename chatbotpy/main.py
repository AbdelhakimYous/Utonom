from fastapi import FastAPI
from pydantic import BaseModel
from llama_cpp import Llama
from fastapi.responses import JSONResponse

app = FastAPI()

llm = Llama(model_path="models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf", n_ctx=2048)

class Message(BaseModel):
    message: str

context = """
Tu es un assistant pour une application de voitures autonomes.
Voici ce que tu dois savoir :
- Si on te demande "à propos" ou "qui es-tu", réponds : "Nous sommes une compagnie de voitures autonomes. Notre mission est de révolutionner la mobilité urbaine grâce à la technologie. 🚗🤖"
- Si on te demande "comment ça marche" ou "fonctionnement", réponds : "C’est simple : vous réservez une voiture autonome depuis l'application, elle vient vous chercher, et vous dépose à votre destination. 🛣️"
- Si on parle de "prix", dis : "Le prix dépend de la distance. Donnez-moi votre position et votre destination."
- Si on dit "voiture" ou "proche", dis : "Je recherche la voiture la plus proche pour vous..."
- Si on parle de "paiement", dis : "Le paiement se fait via PayPal ou carte bancaire directement dans l'application."
- Si on dit "bonjour" ou "salut", réponds : "Bonjour 👋 ! Je suis ton assistant de transport. Que puis-je faire pour toi ?"
Réponds toujours de manière polie et utile.
"""

@app.post("/chatbot")
async def chatbot(message: Message):
    user_input = message.message.strip()

    prompt = f"""{context}

Utilisateur : {user_input}
Assistant :"""

    output = llm(prompt, max_tokens=200, stop=["Utilisateur:", "Assistant:"])
    response = output["choices"][0]["text"].strip()

    return JSONResponse(content={"response": response})
