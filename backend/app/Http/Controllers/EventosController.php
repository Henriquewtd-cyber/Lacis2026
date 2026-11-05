<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use App\Repositories\EventosRepository;
use App\Services\ImagemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EventosController extends Controller
{
    public function __construct(
        private EventosRepository $eventosRepository,
        private ImagemService $imagemService,
    ) {
    }

    // ---------- publico ----------

    // GET /api/eventos
    public function index(): JsonResponse
    {
        $eventos = $this->eventosRepository->publicados()
            ->map(fn (Evento $evento) => $evento->paraPublico());

        return response()->json($eventos);
    }

    // GET /api/eventos/{id}
    public function show(int $id): JsonResponse
    {
        $evento = $this->eventosRepository->findPublicado($id);

        if (!$evento) {
            return $this->naoEncontrado();
        }

        return response()->json($evento->paraPublico());
    }

    // ---------- admin ----------

    // GET /api/admin/eventos
    public function adminIndex(): JsonResponse
    {
        $eventos = $this->eventosRepository->todos()
            ->map(fn (Evento $evento) => $evento->paraAdmin());

        return response()->json($eventos);
    }

    // GET /api/admin/eventos/{id}
    public function adminShow(int $id): JsonResponse
    {
        $evento = $this->eventosRepository->find($id);

        if (!$evento) {
            return $this->naoEncontrado();
        }

        return response()->json($evento->paraAdmin());
    }

    // POST /api/eventos
    public function store(Request $request): JsonResponse
    {
        $dados = $request->validate($this->regras(criacao: true), $this->mensagens(), $this->atributos());
        unset($dados['imagem'], $dados['imagem_remover']);
        $dados['publicado'] = $request->boolean('publicado');

        $novaImagem = null;
        if ($request->hasFile('imagem')) {
            $novaImagem = $this->imagemService->salvarComoWebp($request->file('imagem'), 'eventos');
            $dados['imagem'] = $novaImagem;
        }

        try {
            $evento = $this->eventosRepository->create($dados);
        } catch (\Throwable $e) {
            // nao deixa imagem orfa no disco se o banco recusar a gravacao
            $this->imagemService->remover($novaImagem);
            throw $e;
        }

        return response()->json($evento->paraAdmin(), 201);
    }

    // PUT /api/eventos/{id}
    // Com arquivo (multipart), envie POST /api/eventos/{id} com _method=PUT.
    public function update(Request $request, int $id): JsonResponse
    {
        $evento = $this->eventosRepository->find($id);
        if (!$evento) {
            return $this->naoEncontrado();
        }

        $dados = $request->validate($this->regras(criacao: false), $this->mensagens(), $this->atributos());
        unset($dados['imagem'], $dados['imagem_remover']);
        if ($request->has('publicado')) {
            $dados['publicado'] = $request->boolean('publicado');
        }

        $novaImagem = null;
        $imagemAntiga = null;
        if ($request->hasFile('imagem')) {
            // troca de imagem: a antiga so e apagada depois que o banco aceitar
            $novaImagem = $this->imagemService->salvarComoWebp($request->file('imagem'), 'eventos');
            $dados['imagem'] = $novaImagem;
            $imagemAntiga = $evento->imagem;
        } elseif ($request->boolean('imagem_remover')) {
            $dados['imagem'] = null;
            $imagemAntiga = $evento->imagem;
        }

        try {
            $evento = $this->eventosRepository->update($evento, $dados);
        } catch (\Throwable $e) {
            $this->imagemService->remover($novaImagem);
            throw $e;
        }

        $this->imagemService->remover($imagemAntiga);

        return response()->json($evento->paraAdmin());
    }

    // DELETE /api/eventos/{id}
    public function destroy(int $id): Response|JsonResponse
    {
        $evento = $this->eventosRepository->find($id);
        if (!$evento) {
            return $this->naoEncontrado();
        }

        $imagem = $evento->imagem;
        $this->eventosRepository->delete($evento);
        $this->imagemService->remover($imagem);

        return response()->noContent();
    }

    // ---------- validacao ----------

    private function regras(bool $criacao): array
    {
        $obrigatorio = $criacao ? 'required' : 'sometimes|required';

        return [
            'titulo'         => "$obrigatorio|string|max:255",
            'resumo'         => 'nullable|string|max:10000',
            'data'           => "$obrigatorio|date_format:Y-m-d",
            'horario'        => 'nullable|string|max:50',
            'local'          => 'nullable|string|max:255',
            'video_url'      => 'nullable|url:http,https|max:2048',
            'link'           => 'nullable|url:http,https|max:2048',
            'imagem'         => 'nullable|image|mimes:jpeg,png,webp,gif,bmp|max:5120',
            'imagem_remover' => 'sometimes|boolean',
            'publicado'      => 'sometimes|boolean',
        ];
    }

    private function mensagens(): array
    {
        return [
            'required'    => 'O campo :attribute é obrigatório.',
            'string'      => 'O campo :attribute deve ser um texto.',
            'max.string'  => 'O campo :attribute deve ter no máximo :max caracteres.',
            'max.file'    => 'A :attribute deve ter no máximo 5 MB.',
            'date_format' => 'O campo :attribute deve estar no formato AAAA-MM-DD.',
            'url'         => 'O campo :attribute deve ser um endereço começando com http:// ou https://.',
            'image'       => 'A :attribute deve ser uma imagem.',
            'mimes'       => 'A :attribute deve ser JPEG, PNG, WebP, GIF ou BMP.',
            'boolean'     => 'O campo :attribute deve ser verdadeiro ou falso.',
        ];
    }

    private function atributos(): array
    {
        return [
            'titulo'         => 'título',
            'resumo'         => 'resumo',
            'data'           => 'data',
            'horario'        => 'horário',
            'local'          => 'local',
            'video_url'      => 'link do vídeo',
            'link'           => 'link',
            'imagem'         => 'imagem',
            'imagem_remover' => 'remover imagem',
            'publicado'      => 'publicado',
        ];
    }

    private function naoEncontrado(): JsonResponse
    {
        return response()->json(['message' => 'Evento não encontrado.'], 404);
    }
}
