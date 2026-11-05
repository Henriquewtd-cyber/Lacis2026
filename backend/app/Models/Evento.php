<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Evento extends Model
{
    protected $table = 'eventos';

    protected $fillable = [
        'titulo',
        'resumo',
        'data',
        'horario',
        'local',
        'imagem',
        'video_url',
        'link',
        'publicado',
    ];

    protected $casts = [
        'data' => 'date:Y-m-d',
        'publicado' => 'boolean',
    ];

    /**
     * Formato que a página de programação do frontend espera
     * (frontend/src/pages/programacao/evento/tipoevento.ts).
     */
    public function paraPublico(): array
    {
        return [
            'id'        => $this->id,
            'titulo'    => $this->titulo,
            'resumo'    => $this->resumo,
            'data'      => $this->data?->format('Y-m-d'),
            'horario'   => $this->horario,
            'local'     => $this->local,
            'imagemUrl' => $this->imagem ? Storage::disk('public')->url($this->imagem) : null,
            'videoUrl'  => $this->video_url,
            'link'      => $this->link,
        ];
    }

    /**
     * Formato do painel admin: o mesmo do público mais o status e as datas de registro.
     */
    public function paraAdmin(): array
    {
        return $this->paraPublico() + [
            'publicado'  => $this->publicado,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}