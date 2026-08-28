# Tecnosan Gerência de Projetos

Aplicação web para gerenciamento de projetos, orçamentos, equipes, materiais, equipamentos, receitas e apontamentos de horas da Tecnosan.

Este guia mostra como preparar o projeto do zero, executar a aplicação e fazer o primeiro login.

## Visão rápida

O projeto possui duas partes:

- **Frontend:** tela da aplicação, construída com React e Vite.
- **API:** servidor responsável pelas regras do sistema e pelo acesso ao PostgreSQL.

Para funcionar localmente, as duas partes precisam estar em execução e a API precisa conseguir acessar o banco.

## Onde cada parte está hospedada

| Parte | Hospedagem atual | Endereço ou configuração |
| --- | --- | --- |
| Frontend | Vercel | https://tecnosan-gerencia-projetos.vercel.app |
| API | Não definido neste repositório | Informe aqui a URL pública da API quando ela estiver publicada |
| PostgreSQL | Não definido neste repositório | A API usa `DATABASE_URL` ou as variáveis `DB_*` |

O endereço do frontend acima aparece na configuração de CORS da API e no arquivo `client/vercel.json`. O projeto não contém uma configuração de hospedagem da API ou do banco, portanto esses dois endereços precisam ser confirmados com o responsável pela infraestrutura antes de um deploy.

Para o frontend publicado funcionar, a variável `VITE_API_URL` deve estar configurada no projeto da Vercel com o endereço público da API. Sem essa variável, o frontend tenta usar `http://localhost:3001`, que só funciona na máquina local.

## Cópia local para testes

É possível manter uma cópia completa do sistema no computador sem alterar a versão publicada. A cópia local usa um banco separado, a API em `localhost:3001` e o frontend em `localhost:5173`.

O fluxo é:

1. Instalar Node.js, npm e PostgreSQL.
2. Criar o banco local `tecnosan`.
3. Executar `api/database/schema.sql` nesse banco.
4. Configurar `api/.env` com as credenciais locais.
5. Executar `npm install` na raiz.
6. Executar `npm run seed` para criar dados de teste.
7. Executar `npm run dev` na raiz.
8. Acessar http://localhost:5173.

Essa cópia local não utiliza automaticamente os dados da produção. Para evitar alterações acidentais, use credenciais e um banco de testes diferentes dos recursos hospedados.

## 1. Instale os requisitos

Instale os programas abaixo antes de começar:

- [Node.js](https://nodejs.org/) 20 ou superior, que já inclui o npm.
- [PostgreSQL](https://www.postgresql.org/download/) 14 ou superior.
- [Git](https://git-scm.com/downloads), caso ainda não tenha o projeto na sua máquina.

Durante a instalação do PostgreSQL, anote a senha definida para o usuário `postgres`. Ela será usada na configuração da API.

## 2. Abra o projeto

Se o projeto estiver em um repositório Git, clone-o e entre na pasta:

```bash
git clone URL_DO_REPOSITORIO
cd Tecnosan_Gerencia_Projetos
```

Caso já tenha recebido a pasta do projeto, apenas abra um terminal dentro dela. Essa é a **pasta raiz**, onde ficam `package.json`, `api/` e `client/`.

## 3. Instale as dependências

No terminal aberto na pasta raiz, execute:

```bash
npm install
```

Esse comando instala as dependências usadas pelo frontend, pela API e pelo script que inicia os dois serviços.

## 4. Crie o banco de dados

Crie um banco PostgreSQL com o nome `tecnosan`.

### Opção A: usando o pgAdmin

1. Abra o pgAdmin e conecte-se ao servidor PostgreSQL.
2. Clique com o botão direito em **Databases** e escolha **Create > Database**.
3. Informe `tecnosan` no campo **Database**.
4. Salve.
5. Abra o **Query Tool** do banco `tecnosan`.
6. Abra o arquivo `api/database/schema.sql`, cole o conteúdo no Query Tool e execute.

### Opção B: usando o terminal

```bash
createdb -U postgres tecnosan
psql -U postgres -d tecnosan -f api/database/schema.sql
```

O arquivo `schema.sql` cria as tabelas, relacionamentos, views e triggers necessários para a aplicação.

## 5. Configure a API

Crie ou edite o arquivo `api/.env` com os dados da sua instalação do PostgreSQL:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=tecnosan
DB_PASSWORD=sua_senha_do_postgres
DB_PORT=5432
JWT_SECRET=troque-por-uma-chave-secreta
NODE_ENV=development
```

Substitua `sua_senha_do_postgres` pela senha real do PostgreSQL. O `JWT_SECRET` deve ser uma chave própria, usada para assinar as sessões de login.

Não compartilhe o arquivo `.env` nem coloque senhas reais no repositório.

## 6. Adicione dados de demonstração

Ainda na pasta raiz, execute:

```bash
npm run seed
```

Esse comando cria registros iniciais de departamentos, usuários, materiais, orçamento, projeto, receitas e outros dados relacionados. Ele pode ser executado novamente sem duplicar os principais registros.

Se aparecer um erro de conexão, volte ao passo 5 e confira a senha, o nome do banco e se o serviço do PostgreSQL está ligado.

## 7. Inicie a aplicação local

Na pasta raiz, execute:

```bash
npm run dev
```

O comando inicia o frontend e a API ao mesmo tempo. Mantenha esse terminal aberto enquanto estiver usando o sistema. Se você fechar o terminal, os dois servidores serão encerrados.

Abra no navegador:

- Aplicação: http://localhost:5173
- Status da API: http://localhost:3001/

Se o status da API mostrar `{"status":"ok"}`, o servidor está respondendo corretamente.

## 8. Faça o primeiro login

Use uma das contas criadas pelo seed:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Gestor | `gestor.demo@tecnosan.com.br` | `Tecnosan123!` |
| Técnico | `tecnico.demo@tecnosan.com.br` | `Tecnosan123!` |

Essas contas são apenas para desenvolvimento. Altere ou remova os usuários de demonstração antes de disponibilizar o sistema em produção.

## Se precisar iniciar separadamente

Normalmente `npm run dev` é suficiente. Para executar cada parte em um terminal diferente:

**Terminal 1, API:**

```bash
cd api
npm install
npm run dev
```

**Terminal 2, frontend:**

```bash
cd client
npm install
npm run dev
```

## Usar outra URL para a API

Em desenvolvimento, o frontend usa automaticamente `http://localhost:3001`. Para apontar para uma API diferente, crie `client/.env`:

```env
VITE_API_URL=https://seu-endereco-da-api
```

Depois de alterar esse arquivo, pare e inicie novamente o frontend.

## Comandos úteis

Execute os comandos abaixo a partir da pasta indicada:

| Pasta | Comando | Para que serve |
| --- | --- | --- |
| raiz | `npm run dev` | Inicia frontend e API juntos |
| raiz | `npm run seed` | Insere dados de demonstração |
| `client/` | `npm run build` | Gera o build de produção do frontend |
| `client/` | `npm run lint` | Verifica problemas de código no frontend |

## Problemas comuns

**A aplicação abre, mas não carrega dados**

Confirme se a API está rodando e se `http://localhost:3001/` responde `{"status":"ok"}`. Se necessário, confira `VITE_API_URL` em `client/.env`.

**Erro ao conectar com o PostgreSQL**

Confirme se o PostgreSQL está em execução e se `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST` e `DB_PORT` no `api/.env` correspondem à sua instalação.

**Erro informando que uma tabela não existe**

Execute o arquivo `api/database/schema.sql` no banco `tecnosan` e depois rode novamente `npm run seed`.

**Uma porta já está em uso**

O frontend usa a porta `5173` e a API usa a porta `3001` por padrão. A porta da API pode ser alterada com `PORT` no `api/.env`; nesse caso, atualize também `VITE_API_URL`.

## Para produção

Em um ambiente hospedado, configure `DATABASE_URL` na API em vez das variáveis `DB_*`. A conexão com `DATABASE_URL` utiliza SSL. No frontend, configure `VITE_API_URL` com o endereço público da API antes de executar o build.