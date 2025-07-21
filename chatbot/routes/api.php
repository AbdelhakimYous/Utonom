<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ChatbotController;

Route::post('/chatbot', [ChatbotController::class, 'handle']);
