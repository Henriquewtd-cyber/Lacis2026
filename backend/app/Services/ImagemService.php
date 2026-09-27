<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImagemService
{
    /**
     * Converte a imagem enviada para WebP e salva no disco 'public',
     * dentro da pasta 'cidades'. Retorna o caminho relativo salvo.
     *
     * Usa apenas a extensão GD (nativa do PHP), sem depender de pacotes externos.
     * Caso o GD não consiga decodificar/gerar WebP (raro, mas possível em alguns
     * builds sem suporte a WebP), cai de volta para salvar o arquivo original.
     */
    public function salvarComoWebp(UploadedFile $arquivo, string $pasta = 'cidades'): string
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
            return $arquivo->store($pasta, 'public');
        }

        // Preserva transparência em PNGs
        imagepalettetotruecolor($imagem);
        imagealphablending($imagem, true);
        imagesavealpha($imagem, true);

        $nomeArquivo = $pasta . '/' . uniqid('img_', true) . '.webp';
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
            return $arquivo->store($pasta, 'public');
        }

        return $nomeArquivo;
    }

    /**
     * Remove uma imagem do disco 'public', se existir.
     */
    public function remover(?string $caminho): void
    {
        if ($caminho) {
            Storage::disk('public')->delete($caminho);
        }
    }
}