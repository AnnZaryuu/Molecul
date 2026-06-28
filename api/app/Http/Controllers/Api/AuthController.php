<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Fungsi Register
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'password' => Hash::make($request->password),
        ]);

        // Muat ulang dari database agar field default seperti 'coins' ikut masuk ke JSON
        $user->refresh();

        // Buat Token API
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    // Fungsi Login
    public function login(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('name', $request->name)->first();

        if (!$user) {
            return response()->json(['message' => 'Akun tidak ditemukan.'], 404);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Password salah.'], 401);
        }

        // Buat Token API
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    // Fungsi Logout
    public function logout(Request $request)
    {
        // Hapus token yang digunakan saat ini
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil!'
        ]);
    }

    // Fungsi Get Current User
    public function user(Request $request)
    {
        $user = $request->user()->load('predictions');
        return response()->json($user);
    }
}
