<?php

namespace App\Http\Controllers;

use App\Models\Cidade;
use App\Imports\CidadesImport;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use App\Services\NormalizerService;
use Illuminate\Support\Facades\Storage;

class CidadesController extends Controller
{
    // GET /api/cidades?estado=PR&nome_cidade=Colorado
    public function show(Request $request)
    {
        $request->validate([
            'estado'      => 'required|string|max:2',
            'nome_cidade' => 'required|string',
        ]);

        $cidade = Cidade::where('estado', strtoupper($request->query('estado')))
            ->where('nome_simples', NormalizerService::cidade($request->query('nome_cidade')))
            ->first();

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
        ]);

        $dados['nome_simples'] = NormalizerService::cidade($dados['nome_cidade']);
        $dados['estado'] = strtoupper($dados['estado']);

        foreach (['foto_perfil', 'foto_1', 'foto_2'] as $campo) {
            if ($request->hasFile($campo)) {
                $dados[$campo] = $this->salvarImagemWebp($request->file($campo));
            } else {
                unset($dados[$campo]);
            }
        }

        $cidade = Cidade::create($dados);

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
        $cidade = Cidade::where('estado', strtoupper($request->input('estado')))
            ->where('nome_simples', NormalizerService::cidade($request->input('nome_cidade')))
            ->first();

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
            'url'             => 'sometimes|string',

            'foto_perfil' => 'nullable|image',
            'foto_1'      => 'nullable|image',
            'foto_2'      => 'nullable|image',
        ]);

        if (isset($dados['nome_cidade'])) {
            $dados['nome_simples'] = NormalizerService::cidade($dados['nome_cidade']);
        }

        if (isset($dados['estado'])) {
            $dados['estado'] = strtoupper($dados['estado']);
        }

        foreach (['foto_perfil', 'foto_1', 'foto_2'] as $campo) {
            if ($request->hasFile($campo)) {
                // remove a foto antiga se existir
                if ($cidade->$campo) {
                    Storage::disk('public')->delete($cidade->$campo);
                }
                $dados[$campo] = $this->salvarImagemWebp($request->file($campo));
            } else {
                unset($dados[$campo]);
            }
        }

        $cidade->update($dados);

        return response()->json($cidade);
    }

    // POST /api/cidades/importar
    // POST /api/cidades/importar
    public function import(Request $request)
    {
        $request->validate([
            'arquivo' => 'required|file|mimes:xlsx,csv'
        ]);

        $arquivo = $request->file('arquivo');
        $import = new CidadesImport();

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

    /**
     * Converte a imagem enviada para WebP e salva no disco 'public',
     * dentro da pasta 'cidades'. Retorna o caminho relativo salvo.
     *
     * Usa apenas a extensão GD (nativa do PHP), sem depender de pacotes externos.
     * Caso o GD não consiga decodificar/gerar WebP (raro, mas possível em alguns
     * builds sem suporte a WebP), cai de volta para salvar o arquivo original.
     */
    private function salvarImagemWebp(UploadedFile $arquivo): string
    {
        $caminhoTemp = $arquivo->getRealPath();
        $mime = $arquivo->getMimeType();

        $imagem = match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($caminhoTemp),
            'image/png'  => @imagecreatefrompng($caminhoTemp),
            'image/webp' => @imagecreatefromwebp($caminhoTemp),
            'image/gif'  => @imagecreatefromgif($caminhoTemp),
            'image/bmp'  => @imagecreatefrombmp($caminhoTemp),
            default      => null,
        };

        // Se não deu pra decodificar (ou não há suporte a webp no GD),
        // salva o arquivo original mesmo, sem conversão.
        if (!$imagem || !function_exists('imagewebp')) {
            return $arquivo->store('cidades', 'public');
        }

        // Preserva transparência em PNGs
        imagepalettetotruecolor($imagem);
        imagealphablending($imagem, true);
        imagesavealpha($imagem, true);

        $nomeArquivo = 'cidades/' . uniqid('img_', true) . '.webp';
        $caminhoAbsoluto = Storage::disk('public')->path($nomeArquivo);

        // Garante que a pasta de destino existe
        $diretorio = dirname($caminhoAbsoluto);
        if (!is_dir($diretorio)) {
            mkdir($diretorio, 0755, true);
        }

        $sucesso = imagewebp($imagem, $caminhoAbsoluto, 82); // qualidade 82
        imagedestroy($imagem);

        if (!$sucesso) {
            // fallback: salva original se a conversão falhar
            return $arquivo->store('cidades', 'public');
        }

        return $nomeArquivo;
    }
}