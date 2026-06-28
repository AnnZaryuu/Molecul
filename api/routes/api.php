<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PredictionController;
use App\Http\Controllers\Api\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public Routes (Bisa diakses tanpa login)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/dummy-matches', [AdminController::class, 'getDummyMatches']);

// Protected Routes (Harus menyertakan Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Prediction
    Route::post('/predict', [PredictionController::class, 'store']);
    Route::post('/predict/{id}/claim', [PredictionController::class, 'claim']);
    Route::delete('/predict/{id}', [PredictionController::class, 'destroy']);
    
    // Admin
    Route::post('/admin/resolve-match', [AdminController::class, 'resolveMatch']);
    Route::get('/admin/users', [AdminController::class, 'getUsers']);
    Route::put('/admin/users/{id}/coins', [AdminController::class, 'updateCoins']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
    Route::post('/admin/dummy-matches', [AdminController::class, 'createDummyMatch']);
});
