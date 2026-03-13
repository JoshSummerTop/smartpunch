<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('punch_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained()->cascadeOnDelete();
            $table->string('item_number');
            $table->text('description');
            $table->string('location')->nullable();
            $table->string('trade');
            $table->string('severity');
            $table->string('status')->default('open');
            $table->string('assigned_to')->nullable();
            $table->text('suggested_action')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('resolution_photo_path')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['project_id', 'status']);
            $table->index(['project_id', 'trade']);
            $table->index(['project_id', 'severity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('punch_items');
    }
};
