<?php

return [
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // Com o token indo no header Authorization (não em cookie), não é
    // mais obrigatório restringir a origem — mas se preferir travar,
    // troque '*' pela URL exata do seu front.
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Não precisa mais de true: o token não vai em cookie.
    'supports_credentials' => false,
];