<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaiementController;


Route::post('/paiements', [PaiementController::class, 'store']);
