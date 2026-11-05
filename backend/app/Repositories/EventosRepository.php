<?php

namespace App\Repositories;

use App\Models\Evento;
use Illuminate\Database\Eloquent\Collection;

class EventosRepository
{
    /**
     * Eventos publicados, do mais antigo para o mais novo.
     * O frontend separa "próximos" e "passados" pela data.
     */
    public function publicados(): Collection
    {
        return Evento::where('publicado', true)
            ->orderBy('data')
            ->orderBy('id')
            ->get();
    }

    /**
     * Todos os eventos (publicados e rascunhos), do mais novo para o mais antigo.
     */
    public function todos(): Collection
    {
        return Evento::orderByDesc('data')
            ->orderByDesc('id')
            ->get();
    }

    public function find(int $id): ?Evento
    {
        return Evento::find($id);
    }

    public function findPublicado(int $id): ?Evento
    {
        return Evento::where('publicado', true)->find($id);
    }

    public function create(array $dados): Evento
    {
        return Evento::create($dados);
    }

    public function update(Evento $evento, array $dados): Evento
    {
        $evento->update($dados);

        return $evento;
    }

    public function delete(Evento $evento): void
    {
        $evento->delete();
    }
}