<?php

namespace App\Services;

class NormalizerService
{
    public static function cidade($texto)
    {
        $texto = mb_strtolower($texto);

        // remove acentos
        $texto = iconv(
            'UTF-8',
            'ASCII//TRANSLIT',
            $texto
        );

        // remove caracteres especiais
        $texto = preg_replace('/[^a-z0-9]/', '', $texto);

        return $texto;
    }
}