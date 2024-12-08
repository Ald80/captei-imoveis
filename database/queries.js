import { pool } from './setup.js';

export async function fetchPortal(id) {
    const { rows } = await pool.query("SELECT * from portal WHERE id = $1", [id]);
    return rows[0];
}

export async function startCaptura(portalId) {
    const query = `
        INSERT INTO captura      
        (portal_id, filtros, status, data_hora_inicio_ultima_captura)
        VALUES ($1, '{"filtro": "aluguel"}', 'rodando', NOW())
        RETURNING id
    `;
    const { rows } = await pool.query(query, [portalId]);
    return rows[0];
}

export async function endCaptura(status, capturaId) {
    const query = `
        UPDATE captura
        SET status = $1,
            data_hora_fim_ultima_captura = NOW()
        WHERE id = $2
    `;
    await pool.query(query, [status, capturaId]);
}
