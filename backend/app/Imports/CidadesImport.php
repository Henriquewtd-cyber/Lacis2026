<?php

namespace App\Imports;

use App\Repositories\ImportsRepository;
use App\Services\NormalizerService;
use App\Services\DriveImageService;
use PhpOffice\PhpSpreadsheet\IOFactory;

class CidadesImport
{
    public int $criadas = 0;
    public int $atualizadas = 0;
    public int $ignoradas = 0;
    public array $erros = [];

    /**
     * Cache em memória de todas as cidades já existentes no banco,
     * indexadas por "ESTADO|nome_simples". Evita 1 SELECT por linha
     * da planilha — carregamos tudo de uma vez só, antes do loop.
     */
    private array $cidadesCache = [];

    private const CHAVES_CIDADE = ['municipio', 'cidade', 'nome_cidade'];
    private const CHAVES_ORGAO = ['secretaria_orgao_de_cultura', 'secretaria', 'orgao', 'nome_orgao'];
    private const CHAVES_SECRETARIO = ['nome_do_responsavel', 'secretario', 'nome_secretario'];

    private const CHAVES_FOTOS = [
        'foto_perfil' => ['foto_do_responsavel', 'foto_perfil'],
        'foto_1'      => ['imagem_1_municipio', 'foto_1'],
        'foto_2'      => ['imagem_2_cultura', 'foto_2'],
    ];

    /**
     * Mapa campo da foto => campo que guarda o link de origem (Drive),
     * usado para decidir se é preciso baixar a imagem de novo.
     */
    private const CHAVES_FOTOS_LINK = [
        'foto_perfil' => 'foto_perfil_link',
        'foto_1'      => 'foto_1_link',
        'foto_2'      => 'foto_2_link',
    ];

    private const CHAVE_VALIDO = 'valido_s_ou_n';

    public function __construct(
        private ImportsRepository $importsRepository,
    ) {
    }

    public function importar(string $caminhoArquivo): void
    {
        if (!is_readable($caminhoArquivo)) {
            $this->erros[] = "Arquivo não encontrado ou sem permissão de leitura: {$caminhoArquivo}";
            return;
        }

        $handle = fopen($caminhoArquivo, 'r');

        if ($handle === false) {
            $this->erros[] = "Não foi possível abrir o arquivo: {$caminhoArquivo}";
            return;
        }

        // Carrega todas as cidades existentes de uma vez só (1 query),
        // em vez de 1 SELECT por linha da planilha.
        $this->cidadesCache = $this->importsRepository->carregarCidadesExistentes();

        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        $delimitador = $this->detectarDelimitador($handle);

        $cabecalho = fgetcsv($handle, 0, $delimitador);
        if (!$cabecalho) {
            $this->erros[] = "Não foi possível ler o cabeçalho do CSV";
            fclose($handle);
            return;
        }

        $cabecalho = array_map(fn ($col) => $this->normalizarChave($col), $cabecalho);

        $numeroLinha = 1;

        while (($colunas = fgetcsv($handle, 0, $delimitador)) !== false) {
            $numeroLinha++;

            if (count($colunas) === 1 && trim((string) $colunas[0]) === '') {
                continue;
            }

            if (count($colunas) < count($cabecalho)) {
                $colunas = array_pad($colunas, count($cabecalho), null);
            }

            $linha = array_combine($cabecalho, array_map(
                fn ($valor) => $valor !== null ? $this->paraUtf8(trim($valor)) : null,
                array_slice($colunas, 0, count($cabecalho))
            ));

            $this->processarLinha($linha, $numeroLinha);
        }

        fclose($handle);
    }

    private function processarLinha(array $linha, int $numeroLinha): void
    {
        try {
            $valido = strtolower(trim($linha[self::CHAVE_VALIDO] ?? ''));

            if ($valido !== 's') {
                $this->ignoradas++;
                return;
            }

            $estado = trim($linha['estado'] ?? '');

            if (preg_match('/\(([A-Z]{2})\)$/', $estado, $matches)) {
                $estado = $matches[1];
            } else {
                $estado = strtoupper(substr($estado, 0, 2));
            }

            $nomeCidade = trim($this->primeiroValor($linha, self::CHAVES_CIDADE) ?? '');

            if ($nomeCidade === '' || $estado === '') {
                return;
            }

            $cargo = trim($linha['cargo'] ?? '');
            $nomeOrgao = trim($this->primeiroValor($linha, self::CHAVES_ORGAO) ?? '');
            $nomeSecretario = trim($this->primeiroValor($linha, self::CHAVES_SECRETARIO) ?? '');

            if (!$nomeOrgao || !$nomeSecretario || !$cargo) {
                $this->erros[] = "Linha {$numeroLinha}: órgão, responsável ou cargo ausente";
                return;
            }

            $nomeSimples = NormalizerService::cidade($nomeCidade);
            $chaveCache = $estado . '|' . $nomeSimples;

            // Lookup em memória em vez de query no banco.
            $cidade = $this->cidadesCache[$chaveCache] ?? null;

            $dados = [
                'nome_cidade'     => $nomeCidade,
                'nome_simples'    => $nomeSimples,
                'estado'          => $estado,
                'nome_orgao'      => $nomeOrgao,
                'nome_secretario' => $nomeSecretario,
                'cargo'           => $cargo,
                'url'             => trim($linha['url'] ?? '') ?: null,
            ];

            foreach (self::CHAVES_FOTOS as $campo => $chavesPossiveis) {
                $linkDrive = $this->primeiroValor($linha, $chavesPossiveis);

                if (!$linkDrive) {
                    continue;
                }

                $campoLink = self::CHAVES_FOTOS_LINK[$campo];

                // Se o link da planilha é igual ao que já está salvo,
                // a imagem não mudou — pula o download.
                if ($cidade && $cidade->$campoLink === $linkDrive) {
                    continue;
                }

                $path = DriveImageService::baixarESalvar($linkDrive);

                if ($path) {
                    $dados[$campo] = $path;
                    $dados[$campoLink] = $linkDrive;
                } else {
                    $this->erros[] = "Linha {$numeroLinha}: falha ao baixar {$campo}";
                }
            }

            $dados = $this->sanitizarArray($dados);

            if ($cidade) {
                $cidade = $this->importsRepository->atualizar($cidade, $dados);
                $this->atualizadas++;
            } else {
                $cidade = $this->importsRepository->criar($dados);
                $this->criadas++;
            }

            // Atualiza o cache em memória — evita duplicar caso a
            // mesma cidade apareça mais de uma vez na planilha.
            $this->cidadesCache[$chaveCache] = $cidade;
        } catch (\Throwable $e) {
            $this->erros[] = "Linha {$numeroLinha}: " . $this->paraUtf8($e->getMessage());
        }
    }

     /**
     * Retorna o primeiro valor não vazio dentre as chaves candidatas.
     */
    private function primeiroValor(array $linha, array $chaves): ?string
    {
        foreach ($chaves as $chave) {
            if (!empty($linha[$chave] ?? null)) {
                return $linha[$chave];
            }
        }

        return null;
    }

    /**
     * Detecta se o CSV usa vírgula ou ponto e vírgula como delimitador.
     * Exportações do Excel em pt-BR geralmente usam ";".
     */
    private function detectarDelimitador($handle): string
    {
        $posicaoAtual = ftell($handle);
        $primeiraLinha = fgets($handle);
        fseek($handle, $posicaoAtual);

        if ($primeiraLinha === false) {
            return ',';
        }

        $qtdVirgulas = substr_count($primeiraLinha, ',');
        $qtdPontoVirgula = substr_count($primeiraLinha, ';');

        return $qtdPontoVirgula > $qtdVirgulas ? ';' : ',';
    }

    /**
 * Extrai apenas a aba "Dados organizados" de um XLSX e grava como CSV
 * temporário, no formato que importar() já sabe processar.
 */
public function converterXlsxParaCsv(string $caminhoXlsx): ?string
{
    $planilha = IOFactory::load($caminhoXlsx);

    // Busca a aba pelo nome, ignorando maiúsculas/acentos/espaços extras,
    // para não quebrar se alguém renomear ligeiramente ("Dados Organizados ", etc.)
    $aba = null;
    foreach ($planilha->getAllSheets() as $sheet) {
        $nomeNormalizado = mb_strtolower(trim($sheet->getTitle()));
        if ($nomeNormalizado === 'dados organizados') {
            $aba = $sheet;
            break;
        }
    }

    if (!$aba) {
        $this->erros[] = "Aba 'Dados organizados' não encontrada no arquivo enviado";
        return null;
    }

    $caminhoCsv = tempnam(sys_get_temp_dir(), 'cidades_') . '.csv';
    $handle = fopen($caminhoCsv, 'w');
    fwrite($handle, "\xEF\xBB\xBF"); // BOM UTF-8, pra manter consistência com o resto do parser

    $linhasVaziasSeguidas = 0;

        foreach ($aba->getRowIterator() as $row) {
            $valores = [];
            foreach ($row->getCellIterator() as $cell) {
                $valores[] = $this->valorCelula($cell);
            }

            $linhaVazia = count(array_filter($valores, fn ($v) => trim((string) $v) !== '')) === 0;

            if ($linhaVazia) {
                break;
            }

            $linhasVaziasSeguidas = 0;
            fputcsv($handle, $valores, ',');
        }

    fclose($handle);

    return $caminhoCsv;
}

/**
     * Retorna o valor de uma célula sem forçar o PhpSpreadsheet a recalcular
     * fórmulas. Fórmulas do Google Sheets (QUERY, ARRAYFORMULA, IMPORTRANGE)
     * não existem no motor de cálculo do PhpSpreadsheet e resultariam em
     * erros (#REF!, #NAME?) se recalculadas — por isso usamos o valor já
     * calculado e salvo no arquivo pelo próprio Google Sheets.
     */
    private function valorCelula($cell): string
    {
        if ($cell->isFormula()) {
            $valor = $cell->getOldCalculatedValue();
        } else {
            $valor = $cell->getFormattedValue();
        }

        return trim((string) ($valor ?? ''));
    }

    /**
     * Normaliza o nome de uma coluna do cabeçalho para snake_case,
     * removendo acentos e qualquer pontuação (ex: "Secretaria/Órgão de
     * Cultura" -> "secretaria_orgao_de_cultura", "Imagem 1 (Município)"
     * -> "imagem_1_municipio", "Existe área de Cultura?" -> "existe_area_de_cultura").
     */
    private function normalizarChave(string $chave): string
    {
        $chave = $this->paraUtf8(trim($chave));
        $chave = mb_strtolower($chave);
        $chave = strtr($chave, [
            'á' => 'a', 'à' => 'a', 'ã' => 'a', 'â' => 'a',
            'é' => 'e', 'ê' => 'e',
            'í' => 'i',
            'ó' => 'o', 'ô' => 'o', 'õ' => 'o',
            'ú' => 'u', 'ç' => 'c',
        ]);
        // Qualquer sequência de caracteres que não seja letra/número vira um espaço
        // (isso cobre "/", "(", ")", "?", etc. sem grudar as palavras vizinhas).
        $chave = preg_replace('/[^a-z0-9]+/', ' ', $chave);
        $chave = trim($chave);
        $chave = preg_replace('/\s+/', '_', $chave);

        return $chave;
    }

    /**
     * Garante UTF-8, já que CSVs salvos pelo Excel no Windows
     * costumam vir em Windows-1252 / ISO-8859-1.
     */
    private function paraUtf8(string $valor): string
    {
        if (mb_check_encoding($valor, 'UTF-8')) {
            return $valor;
        }

        return mb_convert_encoding($valor, 'UTF-8', 'Windows-1252');
    }

    /**
     * Aplica paraUtf8() em todo valor string de um array associativo,
     * como última linha de defesa antes de salvar no banco.
     */
    private function sanitizarArray(array $dados): array
    {
        return array_map(
            fn ($valor) => is_string($valor) ? $this->paraUtf8($valor) : $valor,
            $dados
        );
    }
}