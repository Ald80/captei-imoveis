import pkg from 'elasticsearch';
const { Client } = pkg;
import { config } from 'dotenv';
config();

const client = new Client({
  node: process.env.ELASTICSEARCH_HOST,
  requestTimeout: 300000,
});

export async function savePropertiesElasticSearch(properties) {
  try {
    const body = properties.flatMap((doc) => [
      { index: { _index: 'imoveis', _id: doc.id } },
      doc,
    ]);
    const bulkResponse = await client.bulk({
      refresh: true,
      body,
    });

    if (bulkResponse && bulkResponse.errors) {
      console.error(
        'Erros de indexação no ElasticSearch:',
        bulkResponse.items.filter((item) => item.index.status >= 400),
      );
    }

    return properties;
  } catch (error) {
    console.error('Erro de conexão do ElasticSearch:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    throw error;
  }
}
