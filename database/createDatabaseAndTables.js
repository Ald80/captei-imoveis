import { poolDefault, pool } from './setup.js';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  await poolDefault.connect();
  try {
    const dbName = process.env.DB_NAME;
    await poolDefault.query(`CREATE DATABASE ${dbName}`);
    console.log(`Banco de dados ${dbName} criado com sucesso!`);
  } catch (error) {
    console.error('Erro ao criar o banco de dados:', error);
  } finally {
    poolDefault.end();
  }
}

async function createTables() {
  await pool.connect();
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS portal ( 
            id SERIAL PRIMARY KEY, 
            nome VARCHAR(255) NOT NULL, 
            url VARCHAR(255) NOT NULL, 
            observacoes TEXT 
        ); 
        
        CREATE TABLE IF NOT EXISTS captura ( 
            id SERIAL PRIMARY KEY, portal_id INTEGER REFERENCES portal(id), 
            filtros JSONB, status VARCHAR(50), 
            data_hora_inicio_ultima_captura TIMESTAMP, 
            data_hora_fim_ultima_captura TIMESTAMP
        );   
        `);
    console.log('Tabelas criadas com sucesso!');
  } catch (error) {
    console.log('Erro ao criar tabelas:', error);
  }
}

async function InsertDataTabelaPortal() {
  await pool.connect();
  try {
    await pool.query(`
        INSERT INTO portal (nome, url, observacoes) VALUES 
        ('123i', 'https://www.123i.com.br', 'site de imoveis');    
        `);
    console.log('Dados inseridos com sucesso!');
  } catch (error) {
    console.log('Erro ao inserir dados na tabela Portal:', error);
  }
}

(async function main() {
  try {
    await createDatabase();
    await createTables();
    await InsertDataTabelaPortal();
  } finally {
    pool.end();
    process.exit();
  }
})();
