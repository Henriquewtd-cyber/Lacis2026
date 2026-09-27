<?php

namespace App\Repositories;

use App\Models\Cidade;

class ImportsRepository
{
    public function __construct(
        private CidadesRepository $cidadesRepository,
    ) {
    }

    /**
     * Carrega todas as cidades existentes, indexadas por "ESTADO|nome_simples",
     * para lookup em memória (O(1)) durante o processamento da planilha.
     *
     * @return array<string, Cidade>
     */
    public function carregarCidadesExistentes(): array
    {
        return $this->cidadesRepository->allIndexedByEstadoENomeSimples();
    }

    public function criar(array $dados): Cidade
    {
        return $this->cidadesRepository->create($dados);
    }

    public function atualizar(Cidade $cidade, array $dados): Cidade
    {
        return $this->cidadesRepository->update($cidade, $dados);
    }
}