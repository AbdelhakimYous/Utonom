<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function handle(Request $request)
    {
        $message = strtolower($request->input('message'));

        if (!$message) {
            return response()->json(['response' => "Je n’ai pas compris votre demande."]);
        }

        // Réponses personnalisées
        if (str_contains($message, 'à propos') || str_contains($message, 'qui êtes-vous')) {
            return response()->json([
                'response' => "Nous sommes une compagnie de voitures autonomes. Notre mission est de révolutionner la mobilité urbaine grâce à la technologie. 🚗🤖"
            ]);
        }

        if (str_contains($message, 'comment ça marche') || str_contains($message, 'fonctionnement')) {
            return response()->json([
                'response' => "C’est simple : vous réservez une voiture autonome depuis l'application, elle vient vous chercher, et vous dépose à votre destination. 🛣️"
            ]);
        }

        if (str_contains($message, 'prix')) {
            return response()->json(['response' => "Le prix dépend de la distance. Donnez-moi votre position et votre destination."]);
        }

        if (str_contains($message, 'voiture') || str_contains($message, 'proche')) {
            return response()->json(['response' => "Je recherche la voiture la plus proche pour vous..."]);
        }

        if (str_contains($message, 'paiement')) {
            return response()->json(['response' => "Le paiement se fait via PayPal ou carte bancaire directement dans l'application."]);
        }

        if (str_contains($message, 'bonjour') || str_contains($message, 'salut')) {
            return response()->json(['response' => "Bonjour 👋 ! Je suis ton assistant de transport. Que puis-je faire pour toi ?"]);
        }

        return response()->json(['response' => "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ?"]);
    }
}
