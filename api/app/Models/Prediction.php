<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prediction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'match_id',
        'predicted_team_id',
        'wager',
        'status', // pending, won, lost
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
