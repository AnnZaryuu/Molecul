<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('match_id');
            $table->string('predicted_team_id');
            $table->integer('wager')->default(0);
            $table->string('status')->default('pending'); // pending, won, lost
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('predictions');
    }
};
