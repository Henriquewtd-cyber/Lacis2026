# Arquitetura do Projeto LACIS

Este documento descreve a arquitetura geral do projeto **LACIS (ECA/USP)**: como o código está dividido, quais são as responsabilidades de cada parte e quais convenções devem ser seguidas ao evoluir o sistema.

## 1. Visão geral

O projeto é dividido em duas aplicações independentes dentro do mesmo repositório:

| Parte | Tecnologia | Pasta | Papel |
|-------|-----------|-------|-------|
| **Backend** | PHP / Laravel 11 | `backend/` | API REST: regras de negócio, persistência, importação de dados, autenticação administrativa |
| **Frontend** | React + TypeScript + Vite + Tailwind CSS | `frontend/` | SPA que consome a API e apresenta o conteúdo público e o painel administrativo |

As duas partes se comunicam exclusivamente por HTTP/JSON. O frontend não acessa o banco de dados; o backend não renderiza as telas do site (as views Blade padrão do Laravel não são usadas para a interface).

```
┌──────────────────────┐   HTTP / JSON    ┌───────────────────────────┐
│  Frontend (SPA)      │ ───────────────▶ │  Backend (Laravel 11)     │
│  React + TS + Vite   │ ◀─────────────── │  API REST  (routes/api.php)│
└──────────────────────┘                  └─────────────┬─────────────┘
                                                        │
                                          ┌─────────────┴─────────────┐
                                          │  Banco de dados           │
                                          │  Google Drive (imagens)   │
                                          └───────────────────────────┘
```

## 2. Estrutura de pastas (resumo)

```
lacis/
├── README.md
├── docs/            # Documentação técnica, diagramas ER, deploy, handover
├── backend/         # API Laravel 11
└── frontend/        # SPA React + Vite
```

### `docs/`
- `arquitetura/` – diretrizes de arquitetura, camadas e fluxo.
- `database/diagramas/` – diagramas ER (cidades, conteúdo e proposta de expansão), com os scripts `.ps1` que os geram.
- `deploy/` – guias de implantação e hospedagem.
- `desenvolvimento/` – guias de ambiente e padrões de desenvolvimento.
- `handover/` – materiais de transição entre equipes.

## 3. Backend (Laravel 11)

### 3.1 Organização em camadas

O backend segue uma separação em camadas para manter os controllers enxutos:

```
Requisição HTTP
   │
   ▼
routes/api.php          → define os endpoints
   │
   ▼
Middleware              → ex.: AdminTokenAuth protege rotas administrativas
   │
   ▼
Controllers             → recebem a requisição, validam e devolvem a resposta
   │
   ▼
Services                → regras de negócio e integrações
   │
   ▼
Repositories            → consultas e persistência
   │
   ▼
Models (Eloquent)       → mapeamento das tabelas
```

| Camada | Pasta | Conteúdo atual |
|--------|-------|----------------|
| Controllers | `app/Http/Controllers/` | `CidadesController`, `EventosController`, `Auth/AuthController` |
| Middleware | `app/Http/Middleware/` | `AdminTokenAuth` (proteção por token de admin) |
| Services | `app/Services/` | `AdminTokenService`, `DriveImageService`, `ImagemService`, `NormalizerService` |
| Repositories | `app/Repositories/` | `CidadesRepository`, `EventosRepository`, `ImportsRepository` |
| Models | `app/Models/` | `Cidade`, `Evento` |
| Imports | `app/Imports/` | `CidadesImport` (processamento de planilhas) |
| Console | `app/Console/Commands/` | `GenerateAdminHash` (gera o hash do token admin) |

### 3.2 Domínios principais

- **Cidades**: municípios e seus dirigentes de cultura. Possui CRUD, listagem e importação em lote por planilha.
- **Eventos**: programação/agenda exibida no site.
- **Administração**: autenticação por token para o painel restrito.

### 3.3 Autenticação administrativa

A área administrativa usa um **token de administrador**, e não um sistema de usuários:

1. O hash do token é gerado pelo comando Artisan `GenerateAdminHash`.
2. `AuthController` valida o token recebido usando o `AdminTokenService`.
3. O middleware `AdminTokenAuth` protege as rotas que alteram dados.

### 3.4 Serviços de apoio

- **NormalizerService**: sanitiza e normaliza nomes de cidades e UFs (essencial para a importação de planilhas).
- **ImagemService**: upload, validação e manipulação de imagens.
- **DriveImageService**: integração e busca de imagens no Google Drive.

### 3.5 Importação de dados

Há dois caminhos para carregar dados em lote:

- Pela interface administrativa (`importarForm.tsx` → endpoint → `CidadesImport` + `ImportsRepository`).
- Pelo script de linha de comando `backend/scripts/importar.php`.

### 3.6 Banco de dados

- Estrutura versionada em `database/migrations/` (tabelas `cidades` e `eventos`).
- Dados iniciais em `database/seeders/` (`EventosSeeder`).
- Os diagramas ER ficam em `docs/database/diagramas/`.

### 3.7 Testes

Testes automatizados em `backend/tests/` (Feature e Unit), executados com PHPUnit (`phpunit.xml`). Hoje existe cobertura para eventos (`Feature/EventosTest.php`).

## 4. Frontend (React + TypeScript + Vite)

### 4.1 Organização

```
frontend/src/
├── assets/          # Dados estáticos (cultura-estados.json)
├── components/      # Componentes compartilhados (navbar.tsx)
├── pages/
│   ├── home/        # Página inicial (versões desktop e mobile)
│   ├── admin/       # Painel administrativo restrito
│   └── *.tsx        # Páginas públicas: cidades, estados, pesquisas, programacao, sobre, info
├── App.tsx          # Roteamento central (React Router)
├── auth.ts          # Sessão e token no localStorage
├── ProtectedRoute.tsx # Guard de rotas autenticadas
└── main.tsx         # Ponto de entrada
```

### 4.2 Rotas e áreas

- **Área pública**: home, cidades, estados, pesquisas, programação, sobre e informações.
- **Área administrativa** (`pages/admin/`): login, painel, formulário de cidades e importação. O acesso é controlado por `ProtectedRoute` com base na sessão guardada por `auth.ts`.

### 4.3 Conteúdo estático

Parte do conteúdo não vem da API e fica versionada no repositório:

- `src/assets/cultura-estados.json`: base estática dos estados.
- `public/`: bandeiras dos estados, fotos da home, fotos de responsáveis e secretários estaduais, logos e o `Regimento.pdf`.

### 4.4 Responsividade

A home possui implementações separadas para desktop (`home-desktop.tsx`) e mobile (`home-mobile.tsx`), selecionadas em `home-page.tsx`. As demais páginas usam Tailwind CSS responsivo.

## 5. Considerações gerais

**Separação de responsabilidades**
- Regras de negócio ficam no backend (Services); controllers devem apenas orquestrar.
- Acesso a dados passa sempre pelos Repositories, nunca direto nos controllers.
- O frontend deve se limitar à apresentação e ao consumo da API.

**Segurança**
- O token administrativo nunca deve ser versionado; use variáveis de ambiente (`.env`) e o comando `GenerateAdminHash`.
- O token fica no `localStorage` do navegador, o que o expõe a ataques de XSS. Considerar evolução para cookies `HttpOnly` ou um fluxo de usuários com expiração de sessão.
- Validar sempre os dados de entrada no backend, inclusive nos uploads de imagem e nas planilhas importadas.
- Configurar o CORS (`backend/config`) para aceitar apenas a origem do frontend.

**Dados e manutenção**
- Conteúdo que muda com frequência (cidades, eventos) deve ficar no banco; conteúdo estável pode ficar em arquivos estáticos no frontend.
- Alterações de banco devem sempre ser feitas via migrations, mantendo os diagramas em `docs/database/diagramas/` atualizados.
- Imagens e PDFs em `frontend/public/` aumentam o tamanho do repositório; preferir `.webp` e manter os arquivos otimizados.

