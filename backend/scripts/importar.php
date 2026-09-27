<?php


declare(strict_types=1);


/**
 * Sobe a árvore de diretórios a partir de $start até achar um arquivo
 * "artisan", que identifica a raiz de um projeto Laravel.
 */
function findLaravelRoot(string $start): ?string
{
    $dir = $start;
    for ($i = 0; $i < 10; $i++) {
        if (is_file($dir . '/artisan')) {
            return $dir;
        }
        $parent = dirname($dir);
        if ($parent === $dir) {
            break;
        }
        $dir = $parent;
    }
    return null;
}

/**
 * Parser simples de .env (KEY=VALUE por linha, ignora comentários e linhas
 * vazias, remove aspas simples/duplas ao redor do valor). Não substitui a
 * necessidade do vlucas/phpdotenv usado pelo Laravel — é só leitura local
 * para este script standalone.
 *
 * @return array<string,string>
 */
function loadEnvFile(string $path): array
{
    if (!is_file($path) || !is_readable($path)) {
        return [];
    }

    $values = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (!str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        // Remove aspas ao redor do valor, se houver.
        if (strlen($value) >= 2) {
            $first = $value[0];
            $last = $value[strlen($value) - 1];
            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $value = substr($value, 1, -1);
            }
        }
        $values[$key] = $value;
    }
    return $values;
}

/**
 * Resolve um valor de configuração na seguinte ordem de prioridade:
 * variável de ambiente do processo > chave no .env do Laravel > padrão.
 */
function configValue(string $key, string $default, array $dotenv): string
{
    $fromEnv = getenv($key);
    if ($fromEnv !== false && $fromEnv !== '') {
        return $fromEnv;
    }
    if (isset($dotenv[$key]) && $dotenv[$key] !== '') {
        return $dotenv[$key];
    }
    return $default;
}

$laravelRoot = findLaravelRoot(__DIR__);
$dotenv = $laravelRoot !== null ? loadEnvFile($laravelRoot . '/.env') : [];

// =============================================================================
// CONFIGURAÇÃO — AJUSTE OS VALORES PADRÃO ABAIXO SE NÃO FOR USAR O .env
// =============================================================================

// URL do endpoint de login do seu sistema (retorna um token de autenticação).
define('LOGIN_URL', configValue('IMPORTADOR_LOGIN_URL', 'COLOCAR_URL_AQUI', $dotenv));

// URL do endpoint de importação (recebe o arquivo via multipart/form-data).
define('IMPORT_URL', configValue('IMPORTADOR_IMPORT_URL', 'COLOCAR_URL_AQUI', $dotenv));

// URL de exportação do Google Sheets (formato .xlsx). Exemplo típico:
// https://docs.google.com/spreadsheets/d/SEU_ID/export?format=xlsx
define('SHEET_URL', configValue('IMPORTADOR_SHEET_URL', 'COLOCAR_URL_AQUI', $dotenv));

// Credenciais usadas no login.
define('LOGIN_USER', configValue('IMPORTADOR_LOGIN_USER', 'COLOCAR_USUARIO_AQUI', $dotenv));
define('LOGIN_PASSWORD', configValue('IMPORTADOR_LOGIN_PASSWORD', 'COLOCAR_SENHA_AQUI', $dotenv));

// Nomes dos campos enviados no login. Ajuste conforme o seu endpoint espera
// (ex.: alguns sistemas usam "email" em vez de "username").
const LOGIN_USER_FIELD = 'name';
const LOGIN_PASSWORD_FIELD = 'password';

// Nome do campo de arquivo esperado pelo endpoint de importação.
define('FILE_FIELD', configValue('IMPORTADOR_FILE_FIELD', 'arquivo', $dotenv));

// Caminho do arquivo temporário local usado para a planilha baixada.
// Se o script está dentro de um projeto Laravel, usa storage/app/tmp (pasta
// já fora do controle de versão típico); caso contrário, cai para o /tmp do
// sistema. Pode ser sobrescrito via IMPORTADOR_TMP_FILE_PATH no .env/ambiente.
$defaultTmpDir = $laravelRoot !== null ? $laravelRoot . '/storage/app/tmp' : sys_get_temp_dir();
if ($laravelRoot !== null && !is_dir($defaultTmpDir)) {
    @mkdir($defaultTmpDir, 0775, true);
}
define('TMP_FILE_PATH', configValue(
    'IMPORTADOR_TMP_FILE_PATH',
    rtrim($defaultTmpDir, '/') . '/cidades_importacao.xlsx',
    $dotenv
));

// Tempo máximo (segundos) para cada requisição HTTP.
const HTTP_TIMEOUT = 60;

// =============================================================================
// NÃO É NECESSÁRIO ALTERAR NADA ABAIXO DESTA LINHA
// =============================================================================

/**
 * Executa uma requisição HTTP via cURL e retorna [statusCode, body, error].
 *
 * @param string $url
 * @param array<string,mixed> $options Opções extras de cURL (curl_setopt_array).
 * @return array{0:int,1:string,2:?string}
 */
function httpRequest(string $url, array $options = []): array
{
    $ch = curl_init($url);

    curl_setopt_array($ch, $options + [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => HTTP_TIMEOUT,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);

    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    $error = $errno ? curl_error($ch) : null;
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    return [$status, $body === false ? '' : $body, $error];
}

/**
 * Tenta extrair um token de autenticação de uma resposta JSON, procurando
 * pelas chaves mais comuns usadas por APIs. Não inventa estrutura: se não
 * encontrar nenhuma chave conhecida, retorna null.
 *
 * @param mixed $decoded Estrutura já decodificada de json_decode().
 */
function extractToken($decoded): ?string
{
    if (!is_array($decoded)) {
        return null;
    }

    // Chaves de nível raiz mais comuns.
    $candidateKeys = ['token', 'access_token', 'accessToken', 'authToken', 'jwt'];
    foreach ($candidateKeys as $key) {
        if (isset($decoded[$key]) && is_string($decoded[$key]) && $decoded[$key] !== '') {
            return $decoded[$key];
        }
    }

    // Estruturas aninhadas comuns: { data: { token: ... } }, { user: { token: ... } }
    $nestedContainers = ['data', 'result', 'user', 'auth'];
    foreach ($nestedContainers as $container) {
        if (isset($decoded[$container]) && is_array($decoded[$container])) {
            $nested = extractToken($decoded[$container]);
            if ($nested !== null) {
                return $nested;
            }
        }
    }

    return null;
}

/**
 * Mascara um valor sensível para exibição em logs (mostra só os primeiros
 * e últimos caracteres).
 */
function maskSecret(string $value, int $visible = 4): string
{
    $len = strlen($value);
    if ($len <= $visible * 2) {
        return str_repeat('*', $len);
    }
    return substr($value, 0, $visible) . str_repeat('*', $len - $visible * 2) . substr($value, -$visible);
}

function logLine(string $message): void
{
    echo $message . PHP_EOL;
}

function formatBytes(int $bytes): string
{
    if ($bytes >= 1024 * 1024) {
        return round($bytes / (1024 * 1024), 2) . ' MB';
    }
    if ($bytes >= 1024) {
        return round($bytes / 1024, 2) . ' KB';
    }
    return $bytes . ' bytes';
}

/**
 * Interrompe o script com uma mensagem de erro padronizada.
 */
function fail(string $message, ?int $httpStatus = null, ?string $responseBody = null): never
{
    logLine('');
    logLine('[ERRO] ' . $message);
    if ($httpStatus !== null) {
        logLine('HTTP Status: ' . $httpStatus);
    }
    if ($responseBody !== null) {
        // Limita o tamanho exibido para não poluir o log.
        $preview = strlen($responseBody) > 500 ? substr($responseBody, 0, 500) . '... (truncado)' : $responseBody;
        logLine('Resposta: ' . $preview);
    }
    exit(1);
}

// =============================================================================
// FLUXO PRINCIPAL
// =============================================================================

$tmpFileCreated = false;

try {
    // -------------------------------------------------------------------
    // Validação básica de configuração antes de começar.
    // -------------------------------------------------------------------
    $placeholders = [
        'LOGIN_URL' => LOGIN_URL,
        'IMPORT_URL' => IMPORT_URL,
        'SHEET_URL' => SHEET_URL,
        'LOGIN_USER' => LOGIN_USER,
        'LOGIN_PASSWORD' => LOGIN_PASSWORD,
    ];
    foreach ($placeholders as $name => $value) {
        if (str_starts_with($value, 'COLOCAR_')) {
            fail(
                "A configuração {$name} ainda não foi definida. Adicione a variável correspondente " .
                '(ex.: IMPORTADOR_LOGIN_URL, IMPORTADOR_LOGIN_USER, IMPORTADOR_LOGIN_PASSWORD...) ao .env ' .
                'do Laravel, ou ajuste o valor padrão no topo do importar.php.'
            );
        }
    }

    // -------------------------------------------------------------------
    // [1/5] LOGIN
    // -------------------------------------------------------------------
    logLine('[1/5] Fazendo login...');

    $loginPayload = json_encode([
        LOGIN_USER_FIELD => LOGIN_USER,
        LOGIN_PASSWORD_FIELD => LOGIN_PASSWORD,
    ]);

    [$loginStatus, $loginBody, $loginError] = httpRequest(LOGIN_URL, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $loginPayload,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
    ]);

    if ($loginError !== null) {
        fail('Falha de conexão ao tentar fazer login (' . $loginError . ').');
    }

    if ($loginStatus < 200 || $loginStatus >= 300) {
        fail('Login falhou.', $loginStatus, $loginBody);
    }

    $loginDecoded = json_decode($loginBody, true);
    $token = extractToken($loginDecoded);

    if ($token === null) {
        fail(
            'Login retornou status de sucesso, mas não foi possível localizar um token na resposta. ' .
            'Verifique a estrutura do JSON retornado e ajuste extractToken() se necessário.',
            $loginStatus,
            $loginBody
        );
    }

    logLine('[OK] Login realizado. Token obtido: ' . maskSecret($token));
    logLine('');

    // -------------------------------------------------------------------
    // [2/5] DOWNLOAD DA PLANILHA
    // -------------------------------------------------------------------
    logLine('[2/5] Baixando planilha...');

    [$downloadStatus, $downloadBody, $downloadError] = httpRequest(SHEET_URL, [
        CURLOPT_HTTPGET => true,
    ]);

    if ($downloadError !== null) {
        fail('Falha de conexão ao baixar a planilha (' . $downloadError . ').');
    }

    if ($downloadStatus < 200 || $downloadStatus >= 300) {
        fail('Download da planilha falhou.', $downloadStatus, null);
    }

    if (strlen($downloadBody) === 0) {
        fail('O download foi concluído, mas o arquivo recebido está vazio.', $downloadStatus);
    }

    $bytesWritten = file_put_contents(TMP_FILE_PATH, $downloadBody);
    if ($bytesWritten === false) {
        fail('Não foi possível salvar o arquivo temporário em ' . TMP_FILE_PATH . '.');
    }
    $tmpFileCreated = true;

    if (!file_exists(TMP_FILE_PATH) || filesize(TMP_FILE_PATH) === 0) {
        fail('O arquivo temporário não foi criado corretamente ou está vazio.');
    }

    logLine('[OK] Planilha baixada: ' . formatBytes(filesize(TMP_FILE_PATH)));
    logLine('');

    // -------------------------------------------------------------------
    // [3/5] UPLOAD PARA O ENDPOINT DE IMPORTAÇÃO
    // -------------------------------------------------------------------
    logLine('[3/5] Enviando planilha para importação...');

    $cfile = new CURLFile(
        TMP_FILE_PATH,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        basename(TMP_FILE_PATH)
    );

    [$uploadStatus, $uploadBody, $uploadError] = httpRequest(IMPORT_URL, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => [
            FILE_FIELD => $cfile,
        ],
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
            'Accept: application/json',
            // Não definir Content-Type manualmente: o cURL define o boundary
            // correto de multipart/form-data automaticamente ao usar CURLFile.
        ],
    ]);

    if ($uploadError !== null) {
        fail('Falha de conexão ao enviar a planilha (' . $uploadError . ').');
    }

    if ($uploadStatus < 200 || $uploadStatus >= 300) {
        fail('Upload/importação falhou.', $uploadStatus, $uploadBody);
    }

    logLine('[OK] Upload realizado.');
    logLine('');

    // -------------------------------------------------------------------
    // [4/5] RESPOSTA DO SERVIDOR
    // -------------------------------------------------------------------
    logLine('[4/5] Resposta do servidor:');
    $prettyBody = $uploadBody;
    $decodedUpload = json_decode($uploadBody, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        $prettyBody = json_encode($decodedUpload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
    logLine($prettyBody !== false ? $prettyBody : '(resposta vazia ou não textual)');
    logLine('');

    logLine('Importação concluída.');
} finally {
    // -------------------------------------------------------------------
    // [5/5] LIMPEZA — sempre executa, mesmo em caso de erro/exceção.
    // -------------------------------------------------------------------
    if ($tmpFileCreated && file_exists(TMP_FILE_PATH)) {
        logLine('[5/5] Removendo arquivo temporário...');
        if (@unlink(TMP_FILE_PATH)) {
            logLine('[OK] Arquivo removido.');
        } else {
            logLine('[AVISO] Não foi possível remover o arquivo temporário em ' . TMP_FILE_PATH . '.');
        }
    }
}