<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eventos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('resumo')->nullable();
            $table->date('data');
            $table->string('horario', 50)->nullable();
            $table->string('local')->nullable();

            $table->string('imagem')->nullable();          // caminho no disco 'public'
            $table->string('video_url', 2048)->nullable(); // YouTube ou Vimeo
            $table->string('link', 2048)->nullable();      // inscrição ou mais informações

            $table->boolean('publicado')->default(false);

            $table->timestamps();

            $table->index(['publicado', 'data']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eventos');
    }
};