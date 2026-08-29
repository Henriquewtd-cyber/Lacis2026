<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DriveImageService
{
    /**
     * Baixa uma imagem a partir de um link do Google Drive e salva
     * localmente no disco 'public'. Retorna o path salvo (ex: 'cidades/abc123.jpg')
     * ou null se não conseguir baixar.
     */
    public static function baixarESalvar(?string $url, string $pasta = 'cidades'): ?string
    {
        if (!$url) {
            return null;
        }

        $id = self::extractId($url);
        $downloadUrl = $id
            ? "https://drive.google.com/uc?export=download&id={$id}"
            : $url;

        try {
            $response = Http::timeout(30)->get($downloadUrl);

            if (!$response->successful()) {
                Log::warning('DriveImageService: resposta não-2xx', [
                    'url_original' => $url,
                    'id_extraido' => $id,
                    'download_url' => $downloadUrl,
                    'status' => $response->status(),
                ]);
                return null;
            }

            $conteudo = $response->body();
            $contentType = $response->header('Content-Type');

            // Confere se realmente é imagem (Drive às vezes devolve página HTML de aviso)
            if (!$contentType || !str_starts_with($contentType, 'image/')) {
                Log::warning('DriveImageService: resposta não é imagem', [
                    'url_original' => $url,
                    'id_extraido' => $id,
                    'download_url' => $downloadUrl,
                    'status' => $response->status(),
                    'content_type' => $contentType,
                    'tamanho_bytes' => strlen($conteudo),
                    // primeiros 300 caracteres ajudam a identificar página de aviso/confirmação/login
                    'inicio_do_corpo' => substr($conteudo, 0, 300),
                ]);
                return null;
            }

            $extensao = self::extensaoPorMime($contentType);
            $nomeArquivo = $pasta . '/' . Str::uuid() . '.' . $extensao;

            Storage::disk('public')->put($nomeArquivo, $conteudo);

            return $nomeArquivo;
        } catch (\Throwable $e) {
            Log::error('DriveImageService: exceção ao baixar', [
                'url_original' => $url,
                'id_extraido' => $id,
                'download_url' => $downloadUrl,
                'mensagem' => $e->getMessage(),
            ]);
            return null;
        }
    }

    private static function extractId(string $url): ?string
    {
        if (preg_match('/\/d\/([a-zA-Z0-9_-]+)/', $url, $m)) {
            return $m[1];
        }

        if (preg_match('/[?&]id=([a-zA-Z0-9_-]+)/', $url, $m)) {
            return $m[1];
        }

        return null;
    }

    private static function extensaoPorMime(string $mime): string
    {
        return match ($mime) {
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
            default      => 'jpg',
        };
    }
}