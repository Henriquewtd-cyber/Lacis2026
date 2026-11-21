# Deploy - LACIS

Este documento descreve como o projeto LACIS é implantado e quem é responsável por cada etapa.

## Visão geral

O deploy é feito **em conjunto com o departamento de TI da ECA**. A hospedagem é gerenciada pelo **CloudPanel** e o domínio é controlado pelo servidor da ECA.

| Item | Detalhe |
|------|---------|
| Domínio do site | `lacis.eca.usp.br` |
| Controle do domínio | Servidor da ECA (TI da ECA) |
| Hospedagem | CloudPanel |
| Aplicação do frontend | `lacis.eca.usp.br` |
| Aplicação do backend | `api-lacis.eca.usp.br` |
| URL pública da API | `https://lacis.eca.usp.br/api/...` |
| Banco de dados | Fornecido e mantido pela ECA |
| Acesso ao CloudPanel | Credenciais fornecidas pelo TI da ECA |
| Responsável no TI da ECA | alecosta@usp.br |

## Repositório Git

O código-fonte está hospedado no GitHub:

- Repositório: https://github.com/Henriquewtd-cyber/Lacis2026/

O repositório contém as duas aplicações (`frontend/` e `backend/`) e a documentação em `docs/`.

## Aplicações no CloudPanel

O sistema é publicado como **duas aplicações separadas** no CloudPanel:

| Aplicação no CloudPanel | Corresponde a | Pasta do repositório | Caminho no CloudPanel | Tecnologia |
|-------------------------|---------------|----------------------|-----------------------|------------|
| `lacis.eca.usp.br` | Frontend | `frontend/` | `Files/htdocs/lacis.eca.usp.br` | React + TypeScript + Vite |
| `api-lacis.eca.usp.br` | Backend (API) | `backend/` | `Files/htdocs/api-lacis.eca.usp.br` | PHP / Laravel 11 |

Embora o backend seja uma aplicação separada no CloudPanel (pasta `api-lacis.eca.usp.br`), ele é acessado publicamente pelo mesmo domínio do site, no caminho `/api`. Exemplo de requisição:

```
https://lacis.eca.usp.br/api/cidades?estado=SP&nome_cidade=Itaporanga
```

Para a descrição das camadas e da comunicação entre os dois, veja `README_ARQUITETURA.md`.

## Como publicar

O código **não é publicado automaticamente** a partir do Git. O procedimento é manual e diferente para cada aplicação.

### Frontend (`lacis.eca.usp.br`)

1. Rodar o build localmente (`npm run build` na pasta `frontend/`).
2. Compactar o **conteúdo** da pasta `dist/` gerada.
3. Enviar o arquivo compactado ao CloudPanel.
4. Extrair no local correto da aplicação `lacis.eca.usp.br`.

### Backend (`api-lacis.eca.usp.br`)

1. Compactar todo o código PHP do backend (pasta `backend/`).
2. Enviar o arquivo compactado ao CloudPanel.
3. Extrair no local correto da aplicação `api-lacis.eca.usp.br`.
4. Acessar o servidor via **SSH**, entrar na pasta da aplicação e executar os comandos do Laravel:
   ```bash
   composer install --no-dev
   php artisan migrate
   ```
5. Configurar as variáveis de ambiente (veja a seção abaixo).

### Variáveis de ambiente (backend)

As variáveis ficam no arquivo `.env` da aplicação `api-lacis.eca.usp.br`. Há duas formas de configurá-las:

- **Direto no servidor:** editar o `.env` manualmente no servidor (forma usada atualmente).
- **Localmente:** configurar o `.env` na máquina e enviá-lo junto com o código. Também funciona.

O `.env` contém dados sensíveis (conexão com o banco, token administrativo etc.) e **nunca deve ser versionado** no Git.

## Contato e suporte (TI da ECA)

A **permanência** do sistema no ar (servidor, hospedagem, domínio e infraestrutura) é **responsabilidade da ECA**. Em caso de necessidade, abra um chamado.

| Canal | Contato |
|-------|---------|
| Sistema de chamados (preferencial) | https://chamados.sistemas.eca.usp.br/ |
| E-mail | alecosta@usp.br |

Use o sistema de chamados para qualquer solicitação ao TI: acesso ou credenciais do CloudPanel, alterações no domínio, problemas de disponibilidade, banco de dados e demais pedidos de infraestrutura.

### Credenciais

As credenciais do CloudPanel **não ficam no repositório**. Para obtê-las, abra um chamado ao TI da ECA. Nunca registre usuários, senhas ou tokens neste documento ou em qualquer arquivo versionado.

## Banco de dados

O banco de dados pertence à ECA e é compartilhado com outros projetos. O LACIS utiliza **apenas a parte que lhe corresponde**, ou seja, as tabelas do próprio projeto (veja `README_DATABASE.md`). Alterações na estrutura do banco devem ser feitas apenas nas tabelas do LACIS; problemas ou pedidos relacionados ao servidor de banco devem ser encaminhados ao TI por chamado.

## Importação da tabela de cidades

O script `backend/scripts/importar.php` precisa ser **adicionado manualmente no CloudPanel**, na aplicação `api-lacis.eca.usp.br`. Depois de adicionado, ele é executado automaticamente pelo CloudPanel por meio de um **cron job, todos os dias às 00h**.

- Origem do script: `backend/scripts/importar.php`
- Destino: aplicação `api-lacis.eca.usp.br` no CloudPanel
- Execução: cron, diariamente às 00h
- Uso: carga em lote dos dados das cidades, a partir de planilha

A importação também pode ser feita pela interface administrativa do site (tela de importação do painel admin).

## Checklist de deploy

- [ ] Abrir chamado no sistema de chamados da ECA para obter/confirmar acesso ao CloudPanel.
- [ ] Frontend: rodar o build local, compactar o conteúdo de `dist/` e extrair na aplicação `lacis.eca.usp.br`.
- [ ] Backend: compactar o PHP, extrair na aplicação `api-lacis.eca.usp.br` e rodar `composer install --no-dev` e `php artisan migrate` via SSH.
- [ ] Conferir o `.env` do backend, incluindo a conexão com o banco da ECA.
- [ ] Adicionar manualmente o script `importar.php` na aplicação do backend, se ainda não estiver lá.
- [ ] Validar o acesso a `https://lacis.eca.usp.br` e a `https://lacis.eca.usp.br/api/cidades` após a publicação.
- [ ] Em caso de problema na hospedagem, abrir chamado.