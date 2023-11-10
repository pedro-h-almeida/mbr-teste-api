
# Desafio Técnico MBR // Back-end

Aplicação back-end referente ao desafio técnico full-stack proposto pela empresa MBR.


## Preparo

Instale as dependências do projeto

```bash
  cd mbr-teste-api

  yarn install
```

Para executar o projeto rode o comando

```bash
yarn dev
```
## Variáveis de Ambiente

Para rodar esse projeto, você vai precisar criar um arquivo .env e adicionar as seguintes variáveis de ambiente


`DB_HOST` = Host do banco de dados

`DB_PORT` = Porta do banco de dados

`DB_NAME` = Nome do database

`DB_USER` = Usuário do banco de dados

`DB_PASS` = Senha do banco de dados


## Documentação da API

#### Retorna todos os livros

```http
  GET /livros
```

#### Retorna todas as series

```http
  GET /series
```

#### Retorna cinco atividades

```http
  GET /atividades/${idLivro}/${idSerie}
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `idLivro`      | `number` | **Obrigatório**. O ID do livro referente as atividades |
| `idSerie`      | `number` | **Obrigatório**. O ID da serie referente as atividades |

#### Retorna uma atividade

```http
  GET /atividades/${idAtividade}
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `idAtividade`      | `number` | **Obrigatório**. O ID da atividade|


#### Cria uma atividade

```http
  POST /atividades
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `descAtividade`      | `string` | **Obrigatório**. Descrição da atividade |
| `idLivro`      | `number` | **Obrigatório**. O ID do livro referente a atividade |
| `idSerie`      | `number` | **Obrigatório**. O ID da serie referente a atividade |
| `alternativas`      | `array of object` | **Obrigatório**. Um array de objetos contendo as alternativas da atividade |

`alternativas`
| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `descAlternativa`      | `string` | **Obrigatório**. Descrição da alternativa|
| `isCorreta`      | `boolean` | True se a alternativa for a correta (Apenas uma alternativa pode ser marcada como correta)|

#### Atualiza uma atividade

```http
  PUT /atividades
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `idAtividade`      | `number` | **Obrigatório**. ID da atividade |
| `descAtividade`      | `string` |  Descrição da atividade |
| `idLivro`      | `number` |  O ID do livro referente a atividade |
| `idSerie`      | `number` |  O ID da serie referente a atividade |
| `alternativas`      | `array of object` | Um array de objetos contendo as alternativas da atividade |

`alternativas`
| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `idAlternativa`      | `number` | **Obrigatório**. ID da alternativa|
| `descAlternativa`      | `string` |  Descrição da alternativa|
| `isCorreta`      | `boolean` | True se a alternativa for a correta (Apenas uma alternativa pode ser marcada como correta)|


#### Deleta uma atividade

```http
  DELETE /atividades/${idAtividade}
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `idAtividade`      | `number` | **Obrigatório**. O ID da atividade a ser deletada|


## Stack utilizada

Node, Express


## Banco de Dados

![App Screenshot](https://i.imgur.com/JYpnZkj.png)

Criei as tabelas `livros` e `series` para ter um controle melhor nas relações do banco.

Optei por criar a tabela `atividades_respostas` para guardar as respostas corretas, relacionando as tabelas `atividades` e `alternativas`.  
Outras duas opções consideradas foram a inclusão de um campo na tabela `atividades` para armazenar o ID da alternativa correta, ou a criação de um campo booleano na tabela `alternativas`

A inclusão de um campo 'status' nas tabelas, a fim de desativar registros em vez de excluí-los, seria uma alternativa para manter o controle de integridade. Isso impediria, por exemplo, a exclusão de registros relacionados a respostas. No entanto, dado que o projeto não requer o armazenamento das respostas do usuário, optei por não criar esse campo.

A tabela está configurada para realizar a exclusão em cascata das chaves estrangeiras.

O campo 'img' da tabela `livros` foi criado apenas como uma forma de selecionar a imagem exibida nos botões de livros no front-end. Ele faz referência aos nomes das imagens armazenadas na pasta `public`, sendo elas:
```bash
  '/brasil.pgn'
  '/espanha.png'
  '/estados-unidos.png'
  '/icone-mundo.png'
```
`icone-mundo.png` é a imagem padrão utilizada quando o campo se encontra vazio.
