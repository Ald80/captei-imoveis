import { fetchMultiplePagesImoveis } from "./crawler.js";
import { fetchPortal, startCaptura, endCaptura } from '../database/queries.js';
import { savePropertiesElasticSearch } from '../database/elastic.js';

(async function main(){
    let captura;
    try {
        let portalId = 1;
        let portal = await fetchPortal(portalId);
        captura = await startCaptura(portal.id)
        let numeroDePaginas = 5;
        let imoveis = await fetchMultiplePagesImoveis(portal.url, portal.nome, numeroDePaginas);
        await savePropertiesElasticSearch(imoveis);
        await endCaptura('concluido', captura.id);        
        
    } catch (error) {
        console.error('Erro no processo de crawling:', error);
        if (captura.id) {
            await endCaptura('erro', captura.id);
        }
        throw error;
    } finally {
        console.log('Crawler finalizado!');
    }
})();