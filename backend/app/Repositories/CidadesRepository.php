<?php

namespace App\Repositories;

use App\Models\Cidade;
use Illuminate\Database\Eloquent\Collection;

class CidadesRepository
{
    /**
     * Busca uma cidade pelo estado + nome_simples (nome já normalizado).
     */
    public function findByEstadoENome(string $estado, string $nomeSimples): ?Cidade
    {
        return Cidade::where('estado', $estado)
            ->where('nome_simples', $nomeSimples)
            ->first();
    }

    /**
     * Cria uma nova cidade com os dados já tratados.
     */
    public function create(array $dados): Cidade
    {
        return Cidade::create($dados);
    }

    /**
     * Atualiza uma cidade existente com os dados já tratados.
     */
    public function update(Cidade $cidade, array $dados): Cidade
    {
        $cidade->update($dados);

        return $cidade;
    }

    /**
     * Retorna todas as cidades de um estado.
     */
    public function allByEstado(string $estado): Collection
    {
        return Cidade::where('estado', $estado)->get();
    }

    /**
     * Retorna todas as cidades do banco, indexadas por "ESTADO|nome_simples".
     * Usado para carregar um cache em memória (ex: durante importação em massa),
     * evitando 1 SELECT por linha processada.
     *
     * @return array<string, Cidade>
     */
    public function allIndexedByEstadoENomeSimples(): array
    {
        return Cidade::all()
            ->keyBy(fn (Cidade $cidade) => $cidade->estado . '|' . $cidade->nome_simples)
            ->all();
    }
}