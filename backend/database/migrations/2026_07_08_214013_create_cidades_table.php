<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cidades', function (Blueprint $table) {
            $table->id();
            $table->string('nome_cidade');
            $table->string('nome_simples');
            $table->string('estado', 2);
            $table->string('nome_orgao');
            $table->string('nome_secretario');
            $table->string('cargo');

            $table->string('url')->nullable();
            $table->string('foto_perfil')->nullable();
            $table->string('foto_1')->nullable();
            $table->string('foto_2')->nullable();
            $table->timestamps();

            $table->unique(['estado', 'nome_simples']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cidades');
    }
};