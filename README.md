# Tecnosan - Gerência de Projetos

Aplicação web para gestão de projetos, materiais, receitas, equipamentos, acessórios, funcionários e apontamentos de horas.

## Requisitos do projeto

Para rodar este sistema localmente ou em ambiente de testes, são necessários:

- Node.js 18+ (recomendado 20+)
- npm
- PostgreSQL
- Git
- Banco PostgreSQL criado com o nome `tecnosan`
- Arquivo `api/.env` com as credenciais do banco e segredo JWT
- Acesso ao dump SQL do projeto em `api/database/pcp_postgres.sql`

### Requisitos funcionais do sistema

- Frontend em React + Vite
- API em Express.js
- Banco relacional PostgreSQL
- Autenticação via JWT
- CORS configurado para localhost e frontend publicado
- API acessível na porta `3001`
- Frontend acessível na porta `5173`

## Visão geral

O projeto é composto por:

- Frontend React + Vite
- API Express.js
- Banco PostgreSQL

A estrutura está dividida em duas partes principais:

- `client/` : interface web
- `api/` : backend e regras de negócio

## Onde cada parte está hospedada

### Frontend

O frontend está publicado na Vercel:

- https://tecnosan-gerencia-projetos.vercel.app

Esse endereço aparece no CORS da API e também foi usado na configuração do projeto frontend.

### API

O backend está no Render

- https://dashboard.render.com/web/srv-d60du7fgi27c73c85ag0

API local padrão é:

- http://localhost:3001

### Banco PostgreSQL

O banco também não está definido como serviço público neste repositório. Para ambiente local e testes, a abordagem correta é criar um banco PostgreSQL local e apontar a API para ele via variáveis de ambiente.

## Variáveis de ambiente esperadas pela API

O arquivo `api/config/db.js` usa estas variáveis em ordem de prioridade:

- `DATABASE_URL` : conexão completa do PostgreSQL
- ou, em ambiente local:
  - `DB_USER`
  - `DB_HOST`
  - `TECNOSAN`
  - `POSTGRE`
  - `DB_PORT`

O arquivo `api/server.js` também usa:

- `PORT` : porta da API, padrão `3001`
- `JWT_SECRET` : chave para autenticação JWT

Exemplo de `api/.env` local:

```env
DB_USER=postgres
DB_HOST=localhost
DB_PORT=5432
TECNOSAN=tecnosan
POSTGRE=sua_senha_do_postgres
JWT_SECRET=sua_chave_secreta
PORT=3001
```

Se `DATABASE_URL` existir, ela tem prioridade sobre as variáveis separadas.

## Como rodar uma cópia local para testes

### 1. Instale os requisitos

- Node.js 18 ou superior (recomendado 20)
- npm
- PostgreSQL
- Git

### 2. Clone o projeto

```bash
git clone <url-do-repositorio>
cd Tecnosan_Gerencia_Projetos
```

### 3. Instale as dependências

No diretório raiz:

```bash
npm install
```

Também vale instalar as dependências do backend e do frontend, porque cada pasta tem seu próprio `package.json`:

```bash
npm install --prefix api
npm install --prefix client
```

### 4. Crie o banco local

Crie um banco PostgreSQL chamado `tecnosan`.

Via terminal:

```bash
createdb -U postgres tecnosan
```

Depois importe o dump SQL do projeto:

```bash
psql -U postgres -d tecnosan -f api/database/pcp_postgres.sql
```

> O projeto inclui os arquivos `api/database/pcp_postgres.sql` e `api/database/pcp.sql`. Para ambiente local de testes, use `pcp_postgres.sql`.

### 5. Configure a API

Crie o arquivo `api/.env` com os dados do seu PostgreSQL local:

```env
DB_USER=postgres
DB_HOST=localhost
DB_PORT=5432
TECNOSAN=tecnosan
POSTGRE=sua_senha_do_postgres
JWT_SECRET=sua_chave_secreta
PORT=3001
```

Se quiser usar conexão direta:

```env
DATABASE_URL=postgresql://postgres:sua_senha_do_postgres@localhost:5432/tecnosan
JWT_SECRET=sua_chave_secreta
PORT=3001
```

### 6. Inicie os serviços

Na raiz do projeto:

```bash
npm run dev
```

Esse comando usa `concurrently` para levantar ao mesmo tempo:

- Frontend em http://localhost:5173
- API em http://localhost:3001

### 7. Verifique se a API está respondendo

Abra um terminal e execute:

```bash
curl http://localhost:3001/
```

Resposta esperada:

```json
{"status":"ok"}
```

Se a API não iniciar, verifique:

- PostgreSQL ativo
- Banco `tecnosan` existe
- `api/.env` correto
- porta `3001` livre

## Configuração do frontend

O frontend usa o valor abaixo em `client/services/api.js`:

```js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
```

Ou seja, por padrão ele aponta para a API local. Caso a API fique em outra URL, crie `client/.env`:

```env
VITE_API_URL=http://localhost:3001
```

Para produção, use a URL pública da API:

```env
VITE_API_URL=https://sua-api.com
```

## CORS e acesso local

A API permite acesso de:

- http://localhost:5173
- https://tecnosan-gerencia-projetos.vercel.app

Isso explica por que a aplicação local funciona em desenvolvimento e a versão publicada funciona no Vercel.

## Como rodar cada parte separadamente

### API

```bash
cd api
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Usuários e login

A autenticação do sistema usa JWT e as rotas de login estão na API em `/auth`.

Como este repositório não contém um seed de usuários documentado no README, o procedimento recomendado é:

- importar o banco do dump SQL;
- verificar se os registros de `users` já existem no banco;
- ou criar o usuário necessário diretamente no PostgreSQL ou pela tela de cadastro da aplicação.

## Comandos úteis

### Na raiz

```bash
npm run dev
```

### No backend

```bash
cd api
npm run dev
```

### No frontend

```bash
cd client
npm run dev
npm run build
npm run lint
```

## Problemas comuns

### API não conecta no PostgreSQL

Verifique:

- se o PostgreSQL está rodando
- se o banco `tecnosan` foi criado
- se os campos de conexão em `api/.env` estão corretos

### Frontend abre, mas mostra erro de rede

Verifique:

- se a API está respondendo em http://localhost:3001/
- se `VITE_API_URL` aponta para a porta correta
- se o frontend foi reiniciado depois da alteração

### Porta em uso

Se a porta `3001` estiver ocupada:

- altere `PORT` no `api/.env`
- ajuste o valor de `VITE_API_URL` no frontend

## Resumo rápido

```bash
# instalar dependências
npm install
npm install --prefix api
npm install --prefix client

# criar o banco local
createdb -U postgres tecnosan
psql -U postgres -d tecnosan -f api/database/pcp_postgres.sql

# configurar api/.env
# iniciar tudo
npm run dev
```

Acesso local esperado:

- Frontend: http://localhost:5173
- API: http://localhost:3001
