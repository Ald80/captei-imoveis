# Captei Imoveis

## Tecnologias usadas:
- axios
- cheerio
- chromedriver
- dotenv
- elasticsearch
- pg
- selenium-webdriver
- webdriver-manager
- xml2js

## Instalação das ferramentas

- Instale o banco de dados `PostgreSQL`: [link](https://www.postgresql.org/download/)

- Instale o `elasticsearch`: [link](https://www.elastic.co/downloads/elasticsearch)

- Instale o `Node Js`: [link](https://nodejs.org/pt/download/package-manager) 

## Configuração do Elasticsearch

- Para facilitar a execução do elasticsearch, desabilite as opção de segurança e autenticação conforme as intruções abaixo:
    
    - Va até a pasta de `config` do elasticsearch
        ```
        elasticsearch-x.xx.x\config
        ``` 
    - Dentro da pasta, modifique os seguintes variáveis
        ```
        .....
        xpack.security.enabled: false
        xpack.security.transport.ssl.enabled: false
        .....
        ```
    - Insira as variáveis acima caso não as encontre no arquivo 

- inicie o `elasticsearch` (Windows)
```
elasticsearch-x.xx.x\bin\elasticsearch.bat
```

- Caso esteja utilizando outro sistema operacional, siga as instruções do link com a documentação referente a inicialização do elasticsearch: [link](https://www.elastic.co/guide/en/elasticsearch/reference/current/starting-elasticsearch.html)

## Instalação das dependências

- Execute o comando na raiz do projeto para instalar as dependências do projeto
```
npm install
``` 

## Configuração do projeto

Crie um arquivo `.env` na raiz do projeto para inserir os valores de configuração do banco de dados e do `elasticsearch`
```
# Configuração PostgreSQL
DB_HOST=nome-do-host
DB_PORT=porta-usada
DB_NAME=nome-do-banco
DB_USER=usuario-do-banco
DB_PASSWORD=senha_usada

# Configuração ElasticSearch 
ELASTICSEARCH_HOST=url_elasticsearch
REQUESTTIMEOUT=300000
```

Aqui está um exemplo de configuração

```
# Configuração PostgreSQL

DB_HOST='localhost'
DB_PORT=5432
DB_NAME='imoveis_crawler'
DB_USER='postgres'
DB_PASSWORD='123'

# Configuração ElasticSearch 

ELASTICSEARCH_HOST='http://localhost:9200'
REQUESTTIMEOUT=300000
```

## Criação do Banco de Dados 

- Na raiz do projeto, execute o script para criar o banco de dados, criar as tabelas e inserir dados na tabela portal:
```
node database\createDatabaseAndTables.js
```

## Execução do projeto

- Execute o crawler através do comando abaixo

    - OBS: **É necessário que o `elasticsearch` e o `postgresql` estejam rodando para funcionar**
    ```
    node service\index.js
    ```

- Para verificar se os dados foram salvos corretamente no elasticsearch, faça a `requisição http` conforme o exemplo abaixo:

```
GET 

http://localhost:9200/imoveis/_search

application/json
Body: {
    {
    "query": {
        "match_all": {}
    },
    "size": 200
    }
}
```

A requisição acima deve retornar um `JSON` semelhante ao exemplo abaixo:

```
{
  "took": 30,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 119,
      "relation": "eq"
    },
    "max_score": 1.0,
    "hits": [
      {
        "_index": "imoveis",
        "_id": "c81eec08",
        "_score": 1.0,
        "_ignored": [
          "descricao.keyword"
        ],
        "_source": {
          "portal": "123i",
          "url": "https://www.123i.com.br/casa-em-condominio-aluguel-brooklin-paulista-sao-paulo-480m2-4-dorms-3-vagas-IDc81eec08",
          "tipoNegocio": "Aluguel",
          "endereco": "Rua Tomé Portes, Brooklin Paulista, São Paulo",
          "pagina": 1,
          "preco": "21800.00",
          "capturado_em": "2024-12-08T20:29:58.551Z",
          "atualizado_em": "2024-12-08T20:29:58.558Z",
          "id": "c81eec08",
          "titulo": "Casa em Condomínio para alugar em Brooklin Paulista com 480m²  4 quartos,  3 vagas ",
          "descricao": "Casa/Sobrado em condomínio fechado com 12 casas, são 480m² distribuídos em  04 suítes sendo a máster com closet e banheiro sr. e sra., com sacada, hall de distribuição com sala de TV ou home, amplo living para 03 ambientes, com pé direito duplo e lareira integrado a sacada com piscina e espaço gourmet, lavabo, escritório, sala de almoço, cozinha planejada, despensa, no subsolo garagem espaçosa com 5 vagas cobertas, dependência de empregada, salão de festas com bar. O condomínio possui um agradável bosque com lago, repleto de arvores e bancos de madeira. Segurança total.\nAgenda já a sua visita! imovel disponivel a partir de 02/03/2025",
          "quartos": "4",
          "banheiros": "5",
          "vagas_garagem": "3",
          "areaUtil": "480"
        }
      },
....
....
....
```