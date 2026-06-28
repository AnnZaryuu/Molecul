<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DummyMatch extends Model
{
    use HasFactory;

    // Use non-incrementing string ID because we will generate 'dummy_...' IDs
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'team_a_name',
        'team_a_id',
        'team_b_name',
        'team_b_id',
        'status',
        'begin_at',
    ];
}
