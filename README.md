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
- prettier
- eslint

## Instalação das ferramentas

- Instale o banco de dados `PostgreSQL`: [link](https://www.postgresql.org/download/)

- Instale o `elasticsearch`: [link](https://www.elastic.co/downloads/elasticsearch)

- Instale o `Node JS`: [link](https://nodejs.org/pt/download/package-manager) 

## Configuração do Elasticsearch

- Navegue até a pasta de configuração do Elasticsearch:
    ```bash
    cd elasticsearch-x.xx.x/config
    ```

- No arquivo `elasticsearch.yml`, adicione ou modifique as seguintes linhas para desabilitar as opções de segurança (apenas para ambiente de desenvolvimento):
    ```yaml
    xpack.security.enabled: false
    xpack.security.transport.ssl.enabled: false
    ```

- Inicie o `Elasticsearch`:
    - **No Windows:**
      ```bash
      elasticsearch-x.xx.x\bin\elasticsearch.bat
      ```
    - **Outros sistemas operacionais:**
      Consulte a [documentação oficial](https://www.elastic.co/guide/en/elasticsearch/reference/current/starting-elasticsearch.html).

## Instalação das dependências

- Execute o comando na raiz do projeto para instalar as dependências do projeto
    ```bash
    npm install
    ``` 

## Configuração do projeto

Crie um arquivo `.env` na raiz do projeto para inserir os valores de configuração do banco de dados e do `elasticsearch`
```env
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

Aqui está um exemplo de configuração:

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

- Na raiz do projeto, execute o script para configurar o banco de dados, criando as tabelas e inserindo os dados iniciais na tabela portal:
    ```bash
    node database\createDatabaseAndTables.js
    ```

## Execução do projeto

- Certifique-se de que o PostgreSQL e o Elasticsearch estão em execução.
- Inicie o crawler:
    ```bash
    node service/index.js
    ```

## Verificação dos Dados

Para verificar se os dados foram salvos corretamente no Elasticsearch:

- Utilize um cliente HTTP, como Postman ou Insomnia, e faça uma requisição `GET`:
    ```
    GET http://localhost:9200/imoveis/_search
    Content-Type: application/json
    ```

- Corpo da requisição:
    ```json
    {
        "query": {
            "match_all": {}
        },
        "size": 200
    }
    ```

- Você deverá receber uma resposta JSON semelhante a esta:
    ```json
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
              "descricao": "Casa/Sobrado em condomínio fechado com 12 casas, são 480m² distribuídos em  04 suítes sendo a máster com closet e banheiro sr. e sra., com sacada...",
              "quartos": "4",
              "banheiros": "5",
              "vagas_garagem": "3",
              "areaUtil": "480"
            }
          }
        ]
      }
    }
    ```