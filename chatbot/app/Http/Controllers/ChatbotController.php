<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function handle(Request $request)
    {
        $message = strtolower($request->input('message') ?? '');

        if (!$message) {
            return response()->json(['response' => "Je n’ai pas compris votre demande. 🤔"]);
        }

        if (
            str_contains($message, 'à propos') || 
            str_contains($message, 'qui êtes-vous') ||
            str_contains($message, 'présentez-vous') ||
            str_contains($message, 'c’est quoi') ||
            str_contains($message, 'qu’est-ce que')
        ) {
            return response()->json([
                'response' => "Nous sommes une compagnie de voitures autonomes. Notre mission est de révolutionner la mobilité urbaine grâce à la technologie. 🚗🤖"
            ]);
        }

        if (
            str_contains($message, 'comment ça marche') ||
            str_contains($message, 'fonctionnement') ||
            str_contains($message, 'mode d’emploi') ||
            str_contains($message, 'utilisation') ||
            str_contains($message, 'procédure')
        ) {
            return response()->json([
                'response' => "C’est simple : vous réservez une voiture autonome depuis l'application, elle vient vous chercher, et vous dépose à votre destination. 🛣️"
            ]);
        }

        if (
            str_contains($message, 'prix') ||
            str_contains($message, 'tarif') ||
            str_contains($message, 'coût') ||
            str_contains($message, 'combien') ||
            str_contains($message, 'facture')
        ) {
            return response()->json([
                'response' => "Le prix dépend de la distance. Donnez-moi votre position et votre destination. 💰"
            ]);
        }

        if (
            str_contains($message, 'voiture') ||
            str_contains($message, 'véhicule') ||
            str_contains($message, 'proche') ||
            str_contains($message, 'proximité') ||
            str_contains($message, 'disponible')
        ) {
            return response()->json([
                'response' => "Je recherche la voiture la plus proche pour vous... 🚗"
            ]);
        }

        if (
            str_contains($message, 'paiement') ||
            str_contains($message, 'payer') ||
            str_contains($message, 'carte bancaire') ||
            str_contains($message, 'paypal') ||
            str_contains($message, 'moyen de paiement')
        ) {
            return response()->json([
                'response' => "Le paiement se fait via PayPal ou carte bancaire directement dans l'application. 💳"
            ]);
        }

        if (
            str_contains($message, 'bonjour') ||
            str_contains($message, 'salut') ||
            str_contains($message, 'hello') ||
            str_contains($message, 'coucou') ||
            str_contains($message, 'hey')
        ) {
            return response()->json([
                'response' => "Bonjour 👋 ! Je suis ton assistant de transport. Que puis-je faire pour toi ? 😊"
            ]);
        }

        return response()->json([
            'response' => "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ? 🤔"
        ]);
    }
}
