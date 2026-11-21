# Desenvolvimento - LACIS

Este documento registra as principais decisões técnicas do projeto, o fluxo de entrada de dados dos dirigentes de cultura e as tarefas pendentes.

## Decisões técnicas

### Stack do backend: PHP e MySQL

O backend usa **PHP (Laravel 11)** e **MySQL** porque é o que o servidor da ECA executa. Como a hospedagem é do TI da ECA (veja `README_DEPLOY.md`), seguir a tecnologia já disponível evita pedidos de infraestrutura extras e facilita a manutenção.

### Autenticação do painel administrativo

- O painel administrativo (`admin`) é protegido por **senha**.
- Após o login, o frontend guarda um **token no `localStorage`**, com **tempo de expiração**.
- As rotas administrativas do backend são protegidas pelo middleware `AdminTokenAuth`.

O login (`AuthController`) gera o token por meio do `AdminTokenService` e devolve uma resposta JSON neste formato:

```json
{
  "token": "<token gerado>",
  "token_type": "Bearer",
  "expires_at": "<data/hora de expiração em ISO 8601>",
  "user": {
    "name": "<valor de ADMIN_NAME>"
  }
}
```

O frontend envia o token nas requisições administrativas como `Bearer`, e o campo `expires_at` indica até quando ele é válido. O token expira em **8 horas**; depois disso, é necessário fazer login novamente. O tempo de validade é definido no `AdminTokenService`, e o nome do administrador vem da variável de ambiente `ADMIN_NAME`.

### Administrador único

**Não existe, no sistema, forma de criar novos usuários.** Existe um **único administrador, já definido**.

Razão da decisão:

- não há necessidade de múltiplos usuários;
- o site tem baixa manutenção, então um cadastro de usuários, recuperação de senha e níveis de permissão seriam complexidade sem benefício.

A credencial do administrador é gerada pelo comando Artisan `GenerateAdminHash` e configurada no `.env` do servidor. Ela nunca deve ser versionada. Se for necessário trocar a senha, gere um novo hash e atualize o `.env`.

## Entrada de dados dos dirigentes

Os dados dos dirigentes de cultura (módulo Cidades, veja `README_DATABASE.md`) **não são digitados no site**. Eles chegam por um fluxo automatizado a partir de um formulário.

### Fluxo

```
Dirigente responde        Respostas vão para        Validação manual        Script (cron, 00h)         Site
Formulário Google   ───▶  Planilha Google     ───▶  na planilha (s / n) ──▶ lê, baixa e converte ───▶ exibe os dados
                                                                            imagens, grava no banco
```

1. **Formulário Google:** os dirigentes respondem a um formulário.
2. **Planilha Google:** as respostas são gravadas automaticamente em uma planilha, na aba de respostas do formulário (**"Respostas ao formulário 1"**).
3. **Validação:** as informações são validadas na aba **"dados organizados"** da planilha, marcando **`s` (sim) ou `n` (não)**. **Apenas as linhas marcadas com `s` são importadas; qualquer outro valor faz a linha ser ignorada.**
4. **Script de importação:** todos os dias às **00h** o script lê a planilha e **adiciona o que for novo**.
5. **Imagens:** o Drive está aberto, então o script **baixa as imagens**, **converte para WebP** e as associa ao registro.
6. **Banco de dados:** os dados e as imagens tratadas são gravados no banco da ECA e passam a ser exibidos no site.

O script é o `backend/scripts/importar.php`, agendado como cron no CloudPanel (veja `README_DEPLOY.md`). A lógica de apoio está em `CidadesImport`, `NormalizerService`, `DriveImageService` e `ImagemService`.

### Onde fazer alterações na planilha

- **Validação (`s` / `n`):** faça na aba **"dados organizados"**.
- **Demais alterações** (correção de dados, nomes, links de imagens etc.): faça na aba de **respostas do formulário 1**. A aba "dados organizados" apenas **espelha** esses dados, então alterações feitas diretamente nela, fora a validação, não devem ser usadas.

### Acesso ao formulário e à planilha

Os links do formulário e da planilha **não estão neste documento**, por serem arquivos privados. Eles devem ser **solicitados ao professor responsável**, pelo e-mail do LACIS: **lacis@usp.br**.

Não compartilhe permissões de edição fora da equipe responsável.

## Tarefas pendentes

- [ ] **Embutir a pipeline de importação no próprio site do LACIS.** Hoje o fluxo (leitura da planilha, download e conversão de imagens, gravação no banco) roda como script avulso agendado no CloudPanel. A tarefa é integrá-lo à aplicação, de modo que ele faça parte do backend Laravel.