<?php

// Formato no .env (sem espaços em volta do ; e do :):
// ADMIN_USERS="admin:$2y$10$hashDoAdmin;joao:$2y$10$hashDoJoao"
//
// Cada par "nome:hash" separado por ";". O hash é gerado com bcrypt
// (veja o comando `php artisan admin:hash`), então nunca contém ";" ou ":".

return [
    'users' => array_reduce(
        array_filter(explode(';', env('ADMIN_USERS', ''))),
        function (array $carry, string $entry) {
            [$name, $hash] = array_pad(explode(':', trim($entry), 2), 2, null);

            if ($name !== null && $hash !== null) {
                $carry[strtolower($name)] = [
                    'name' => $name,
                    'password' => $hash,
                ];
            }

            return $carry;
        },
        []
    ),

    // Segredo usado para assinar os tokens (HMAC). Se não definir
    // ADMIN_TOKEN_SECRET, cai no APP_KEY do próprio Laravel.
    'token_secret' => env('ADMIN_TOKEN_SECRET', env('APP_KEY')),

    // Tempo de expiração do token, em minutos.
    'token_expiration_minutes' => (int) env('ADMIN_TOKEN_EXPIRATION_MINUTES', 480), // 8h
];