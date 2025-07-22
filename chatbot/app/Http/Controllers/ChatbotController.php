<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    public function handle(Request $request)
    {
        $message = $request->input('message');

        if (!$message) {
            return response()->json(['response' => 'Je n’ai pas compris votre demande.']);
        }

        $apiKey = env('OPENAI_API_KEY');

        $systemContext = "
        Tu es un assistant pour une compagnie de voitures autonomes.
        - Quand on te demande 'à propos' ou 'qui êtes-vous', réponds : 'Nous sommes une compagnie de voitures autonomes. Notre mission est de révolutionner la mobilité urbaine grâce à la technologie. 🚗🤖'
        - Si on te demande 'comment ça marche' ou 'fonctionnement', réponds : 'C’est simple : vous réservez une voiture autonome depuis l'application, elle vient vous chercher, et vous dépose à votre destination. 🛣️'
        - Si on parle de 'prix', réponds : 'Le prix dépend de la distance. Donnez-moi votre position et votre destination.'
        - Si on parle de 'voiture' ou 'proche', réponds : 'Je recherche la voiture la plus proche pour vous...'
        - Si on parle de 'paiement', réponds : 'Le paiement se fait via PayPal ou carte bancaire directement dans l'application.'
        - Si on dit 'bonjour' ou 'salut', réponds : 'Bonjour 👋 ! Je suis ton assistant de transport. Que puis-je faire pour toi ?'
        Réponds toujours de manière polie, claire et utile.
        ";

        $response = Http::withHeaders([
            'Authorization' => "Bearer $apiKey",
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'system', 'content' => $systemContext],
                ['role' => 'user', 'content' => $message],
            ],
        ]);

        return response()->json([
            'response' => $response['choices'][0]['message']['content']
        ]);
    }
}
