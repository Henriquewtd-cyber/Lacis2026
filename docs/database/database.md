# Banco de Dados - LACIS

Este documento descreve o modelo de dados do projeto, organizado por módulo. A estrutura é versionada por migrations em `backend/database/migrations/`.

## Diagramas ER (DER)

Os diagramas entidade-relacionamento estão em `docs/database/diagramas/`, cada um com o script `.ps1` que o gera:

| Diagrama | Arquivo | Script gerador |
|----------|---------|----------------|
| Módulo Cidades | `der-cidades.png` | `der-cidades.ps1` |
| Módulo Conteúdo | `der-conteudo.png` | `der-conteudo.ps1` |
| Proposta de expansão | `der-proposta.png` | `der-proposta.ps1` |

Para alterar um diagrama, edite o script `.ps1` correspondente e execute-o novamente para regenerar a imagem. Sempre que uma migration mudar o modelo, o DER deve ser atualizado.

---

## Cidades

Módulo que armazena os **dirigentes de cultura** dos municípios: o órgão responsável pela cultura na cidade, o secretário (ou dirigente) e os dados de contato e imagens associados.

- **Entidade:** `CIDADE` (tabela `cidades`)
- **Model:** `backend/app/Models/Cidade.php`
- **Diagrama:** `docs/database/diagramas/der-cidades.png`

### Campos

| Campo | Tipo no DER | Observação |
|-------|-------------|------------|
| `id` | Chave | Identificador da cidade |
| `nome_cidade` | Atributo | |
| `nome_simples` | Derivado | Derivado de `nome_cidade` |
| `estado` | Atributo | |
| `nome_orgao` | Atributo | |
| `nome_secretario` | Atributo | |
| `cargo` | Atributo | |
| `url` | Atributo | |
| `created_at` | Atributo | |
| `updated_at` | Atributo | |
| `foto_perfil` | Atributo composto | Subcampos: `arquivo`, `link` |
| `foto_1` | Atributo composto | Subcampos: `arquivo`, `link` |
| `foto_2` | Atributo composto | Subcampos: `arquivo`, `link` |

---

## Textos

_A preencher._

---

## Pesquisas

_A preencher._

---

## Eventos

_A preencher._