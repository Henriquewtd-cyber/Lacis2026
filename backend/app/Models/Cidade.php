<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cidade extends Model
{
    protected $table = 'cidades';

    protected $fillable = [
        'nome_cidade',
        'nome_simples',
        'estado',
        'cargo',
        'nome_orgao',
        'nome_secretario',
        'url',
        'foto_perfil',
        'foto_1',
        'foto_2',
    ];
}