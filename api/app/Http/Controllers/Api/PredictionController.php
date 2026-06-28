<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prediction;
use Illuminate\Http\Request;

class PredictionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'match_id' => 'required|string',
            'predicted_team_id' => 'required|string',
            'wager' => 'required|integer|min:10',
        ]);

        $user = $request->user();

        if ($user->coins < $request->wager) {
            return response()->json(['message' => 'Koin tidak cukup!'], 400);
        }

        // Cek apakah sudah pernah menebak match ini
        $existing = Prediction::where('user_id', $user->id)
            ->where('match_id', $request->match_id)
            ->first();

        if ($existing) {
            // Jika tim yang dipilih berbeda, tolak (Sesuai Opsi A - Tim Dikunci)
            if ($existing->predicted_team_id != $request->predicted_team_id) {
                return response()->json(['message' => 'Anda tidak bisa mengubah tim yang sudah ditebak!'], 400);
            }

            // Kurangi koin
            $user->coins -= $request->wager;
            $user->save();

            // Tambahkan wager
            $existing->wager += $request->wager;
            $existing->save();

            return response()->json([
                'message' => 'Taruhan berhasil ditambahkan!',
                'prediction' => $existing,
                'user_coins' => $user->coins,
            ]);
        }

        // Kurangi koin
        $user->coins -= $request->wager;
        $user->save();

        // Buat prediksi baru
        $prediction = Prediction::create([
            'user_id' => $user->id,
            'match_id' => $request->match_id,
            'predicted_team_id' => $request->predicted_team_id,
            'wager' => $request->wager,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Tebakan berhasil disimpan!',
            'prediction' => $prediction,
            'user_coins' => $user->coins,
        ]);
    }

    public function claim(Request $request, $id)
    {
        $prediction = Prediction::where('id', $id)->where('user_id', $request->user()->id)->first();
        
        if (!$prediction) {
            return response()->json(['message' => 'Prediksi tidak ditemukan.'], 404);
        }

        if ($prediction->status !== 'won') {
            return response()->json(['message' => 'Anda tidak bisa klaim poin ini.'], 400);
        }

        $user = $request->user();
        $user->coins += ($prediction->wager * 2);
        $user->save();

        // Karena mode testing, kita HAPUS prediksinya agar bisa nebak lagi di match yang sama
        $prediction->delete();

        return response()->json([
            'message' => 'Points claimed successfully!',
            'coins' => $user->coins
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $prediction = Prediction::where('id', $id)->where('user_id', $request->user()->id)->first();
        if ($prediction) {
            $prediction->delete();
        }
        return response()->json(['message' => 'Prediction reset.']);
    }
}
