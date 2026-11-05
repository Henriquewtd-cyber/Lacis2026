<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Evento;

class EventosSeeder extends Seeder
{
    public function run(): void
    {
        $eventos = [
            [
                'titulo'    => 'Encontro de Dirigentes',
                'resumo'    => 'Debate sobre cultura nas cidades.',
                'data'      => '2026-11-25',
                'horario'   => '9h às 17h',
                'local'     => 'Auditório da ECA-USP',
                'publicado' => true,
            ],
            [
                'titulo'    => 'Oficina de Projetos Culturais',
                'resumo'    => 'Oficina prática sobre elaboração e gestão de projetos culturais.',
                'data'      => '2026-11-28',
                'horario'   => '14h às 18h',
                'local'     => 'Sala de Eventos',
                'publicado' => true,
            ],
            [
                'titulo'    => 'Seminário de Gestão Cultural',
                'resumo'    => 'Discussão sobre políticas públicas e gestão cultural nos municípios.',
                'data'      => '2026-12-05',
                'horario'   => '10h às 16h',
                'local'     => 'Auditório Principal',
                'publicado' => false,
            ],
        ];

        foreach ($eventos as $dados) {
            Evento::create($dados);
        }
    }
}
