<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ChatbotController;
use Illuminate\Support\Facades\DB;

Route::post('/chatbot', [ChatbotController::class, 'handle']);

Route::get('/testDb', function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            'success' => true,
            'message' => 'Connexion à la chatbot 🚀'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Échec de la connexion à la base de données ❌',
            'error' => $e->getMessage()
        ], 500);
    }
});