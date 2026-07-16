<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prediction;
use App\Models\User;
use App\Models\DummyMatch;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function resolveMatch(Request $request)
    {
        // Pastikan hanya admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'match_id' => 'required|string',
            'winning_team_id' => 'required|string',
        ]);

        $predictions = Prediction::where('match_id', $request->match_id)
            ->where('status', 'pending')
            ->get();

        $resolvedCount = 0;

        foreach ($predictions as $prediction) {
            if ($prediction->predicted_team_id == $request->winning_team_id) {
                $prediction->status = 'won';
                // Hadiah tidak ditambahkan otomatis, harus diklaim oleh user
            } else {
                $prediction->status = 'lost';
            }
            $prediction->save();
            $resolvedCount++;
        }

        // Dummy Match tetap dibiarkan 'upcoming' agar bisa ditebak dan di-resolve berkali-kali untuk testing.

        return response()->json([
            'message' => 'Berhasil menyelesaikan pertandingan!',
            'resolved_predictions_count' => $resolvedCount,
        ]);
    }

    public function getDummyMatches()
    {
        $matches = DummyMatch::where('status', 'upcoming')->get();
        return response()->json($matches);
    }

    public function createDummyMatch(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string',
            'team_a_name' => 'required|string',
            'team_b_name' => 'required|string',
        ]);

        $dummyId = 'dummy_' . uniqid();

        $match = DummyMatch::create([
            'id' => $dummyId,
            'name' => $request->name,
            'team_a_name' => $request->team_a_name,
            'team_a_id' => $dummyId . '_A',
            'team_b_name' => $request->team_b_name,
            'team_b_id' => $dummyId . '_B',
            'begin_at' => now(),
            'status' => 'upcoming',
        ]);

        return response()->json(['message' => 'Dummy match created!', 'match' => $match]);
    }

    public function getUsers(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json($users);
    }

    public function updateCoins(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $request->validate(['coins' => 'required|integer']);

        $user = User::findOrFail($id);
        $user->coins = $request->coins;
        $user->save();

        return response()->json(['message' => 'Coins updated successfully', 'user' => $user]);
    }

    public function deleteUser(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);
        // Jangan hapus admin lain atau diri sendiri
        if ($user->role === 'admin' || $user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete admin account'], 400);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function deleteDummyMatch(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $match = DummyMatch::findOrFail($id);
        $match->delete();

        return response()->json(['message' => 'Dummy match deleted successfully']);
    }
}
