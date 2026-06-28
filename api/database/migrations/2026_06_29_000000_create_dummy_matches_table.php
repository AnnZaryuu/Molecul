<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dummy_matches', function (Blueprint $table) {
            $table->string('id')->primary(); // dummy_XXXX
            $table->string('name');
            $table->string('team_a_name');
            $table->string('team_a_id');
            $table->string('team_b_name');
            $table->string('team_b_id');
            $table->string('status')->default('upcoming');
            $table->timestamp('begin_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dummy_matches');
    }
};
