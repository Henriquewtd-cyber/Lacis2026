<?php

namespace App\Http\Controllers;

use App\Imports\CidadesImport;
use App\Repositories\CidadesRepository;
use App\Services\ImagemService;
use App\Services\NormalizerService;
use Illuminate\Http\Request;

class CidadesController extends Controller
{
    public function __construct(
        private CidadesRepository $cidadesRepository,
        private ImagemService $imagemService,
    ) {
    }

    // GET /api/cidades?estado=PR&nome_cidade=Colorado
    public function show(Request $request)
    {
        $request->validate([
            'estado'      => 'required|string|max:2',
            'nome_cidade' => 'required|string',
        ]);

        $cidade = $this->cidadesRepository->findByEstadoENome(
            strtoupper($request->query('estado')),
            NormalizerService::cidade($request->query('nome_cidade'))
        );

        if (!$cidade) {
            return response()->json([
                'message' => 'Cidade não encontrada'
            ], 404);
        }

        return response()->json($cidade);
    }

    // POST /api/cidades
    public function store(Request $request)
    {
        $dados = $request->validate([
            'nome_cidade'     => 'required|string',
            'estado'          => 'required|string|max:2',
            'nome_orgao'      => 'required|string',
            'nome_secretario' => 'required|string',
            'cargo'           => 'required|string',

            'url'             => 'nullable|string',
            'foto_perfil' => 'nullable|image',
            'foto_1'      => 'nullable|image',
            'foto_2'      => 'nullable|image',

            'foto_perfil_link' => 'nullable|string',
            'foto_1_link'      => 'nullable|string',
            'foto_2_link'      => 'nullable|string',
        ]);

        $dados['nome_simples'] = NormalizerService::cidade($dados['nome_cidade']);
        $dados['estado'] = strtoupper($dados['estado']);

        foreach (['foto_perfil', 'foto_1', 'foto_2'] as $campo) {
            if ($request->hasFile($campo)) {
                $dados[$campo] = $this->imagemService->salvarComoWebp($request->file($campo));
            } else {
                unset($dados[$campo]);
            }

            $linkCampo = $campo . '_link';
            $dados[$linkCampo] = $request->filled($linkCampo)
                ? $request->input($linkCampo)
                : 'sem-link';
        }

        $cidade = $this->cidadesRepository->create($dados);

        return response()->json($cidade, 201);
    }

    // PUT /api/cidades  (identificação via estado + nome_cidade no corpo)
    public function update(Request $request)
    {
        $request->validate([
            'estado'      => 'required|string|max:2',
            'nome_cidade' => 'required|string',
        ]);

        // usa o nome_cidade original (antes de qualquer alteração) para localizar o registro
        $cidade = $this->cidadesRepository->findByEstadoENome(
            strtoupper($request->input('estado')),
            NormalizerService::cidade($request->input('nome_cidade'))
        );

        if (!$cidade) {
            return response()->json([
                'message' => 'Cidade não encontrada'
            ], 404);
        }

        $dados = $request->validate([
            'nome_cidade'     => 'sometimes|string',
            'estado'          => 'sometimes|string|max:2',
            'nome_orgao'      => 'sometimes|string',
            'nome_secretario' => 'sometimes|string',
            'cargo'           => 'sometimes|string',
            'url'             => 'sometimes|nullable|string',

            'foto_perfil' => 'nullable|image',
            'foto_1'      => 'nullable|image',
            'foto_2'      => 'nullable|image',

            'foto_perfil_link' => 'sometimes|nullable|string',
            'foto_1_link'      => 'sometimes|nullable|string',
            'foto_2_link'      => 'sometimes|nullable|string',
        ]);

        if (isset($dados['nome_cidade'])) {
            $dados['nome_simples'] = NormalizerService::cidade($dados['nome_cidade']);
        }

        if (isset($dados['estado'])) {
            $dados['estado'] = strtoupper($dados['estado']);
        }

        foreach (['foto_perfil', 'foto_1', 'foto_2'] as $campo) {
            $linkCampo = $campo . '_link';
            $removerCampo = $campo . '_remover';

            if ($request->hasFile($campo)) {
                // troca de foto: apaga a antiga do storage antes de salvar a nova
                $this->imagemService->remover($cidade->$campo);
                $dados[$campo] = $this->imagemService->salvarComoWebp($request->file($campo));
                $dados[$linkCampo] = $request->filled($linkCampo)
                    ? $request->input($linkCampo)
                    : 'sem-link';
            } elseif ($request->boolean($removerCampo)) {
                // remoção explícita: apaga o arquivo e zera foto + link
                $this->imagemService->remover($cidade->$campo);
                $dados[$campo] = null;
                $dados[$linkCampo] = null;
            } else {
                // nada mudou nessa foto: mantém o que já está salvo
                unset($dados[$campo]);
                if ($request->filled($linkCampo)) {
                    $dados[$linkCampo] = $request->input($linkCampo);
                } else {
                    unset($dados[$linkCampo]);
                }
            }
        }

        $cidade = $this->cidadesRepository->update($cidade, $dados);

        return response()->json($cidade);
    }

    // POST /api/cidades/importar
    public function import(Request $request)
    {
        $request->validate([
            'arquivo' => 'required|file|mimes:xlsx,csv'
        ]);

        $arquivo = $request->file('arquivo');
        $import = app(CidadesImport::class);

        if ($arquivo->getClientOriginalExtension() === 'xlsx') {
            $caminhoCsv = $import->converterXlsxParaCsv($arquivo->getRealPath());

            if (!$caminhoCsv) {
                return response()->json([
                    'message'     => 'Importação falhou',
                    'criadas'     => 0,
                    'atualizadas' => 0,
                    'ignoradas'   => $import->ignoradas,
                    'erros'       => $import->erros,
                ], 422);
            }

            $import->importar($caminhoCsv);
            unlink($caminhoCsv);
        } else {
            $import->importar($arquivo->getRealPath());
        }

        return response()->json([
            'message'     => 'Importação realizada',
            'criadas'     => $import->criadas,
            'atualizadas' => $import->atualizadas,
            'erros'       => $import->erros,
        ]);
    }

    // GET /api/cidades/all?estado=PR
    public function getAll(Request $request)
    {
        $request->validate([
            'estado' => 'required|string|max:2',
        ]);

        $estado = strtoupper($request->query('estado'));

        $cidades = $this->cidadesRepository->allByEstado($estado);

        if ($cidades->isEmpty()) {
            return response()->json([
                'message' => 'Cidades não encontradas'
            ], 404);
        }

        $respostas = $cidades->map(function ($cidade) {
            return [
                'cidade' => $cidade->nome_cidade,
                'id'     => $cidade->id,
            ];
        });

        return response()->json($respostas);
    }
}