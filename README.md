
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
