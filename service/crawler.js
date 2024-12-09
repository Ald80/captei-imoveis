import axios from 'axios';
import * as cheerio from 'cheerio';
import { Builder } from 'selenium-webdriver';

import { Options } from 'selenium-webdriver/chrome.js';

async function fetchPageContent(url){
    let options = new Options();
    options.addArguments('--headless');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    try {
        await driver.get(url);
        await driver.sleep(5000);
        let pageSource = await driver.getPageSource();
        return pageSource;
    } catch (error) {
        console.error('Erro ao carregar página:', error);
    } finally {
        await driver.quit();
    }
}

function formatPriceValue(valueString){
    const regex = /R\$ (\d{1,3}(?:\.\d{3})*,\d{2})/;
    const match = valueString.match(regex);
    if (match) {
        let valor = match[1];
        valor = valor.replace(/\./g, '').replace(',', '.');
        const valorFloat = parseFloat(valor).toFixed(2);
        return valorFloat;
    }
}

async function extractDetails(link) {
    try {
        const responseLink = await axios.get(link, { timeout: 10000 });
        const $linkPage = cheerio.load(responseLink.data);
        const descricao = $linkPage('div.flex.flex-col.gap-2 > p.text-md.text-foxter-brand-900.leading-8').eq(3).text().trim();
        const codes = $linkPage('p:contains("Código do anunciante")').first().text().trim();
        const [_, code123iText] = codes.split('|').map(code => code.trim());
        const code123i = code123iText.match(/Código 123i: (\w+)/)[1];
        const titulo = $linkPage('h1.text-lg.md\\:xl.lg\\:text-2xl.text-foxter-brand-900.font-bold.mb-2.2xl\\:mb-3').text();
        const detailsContainer = $linkPage('div.flex.flex-wrap.py-3.items-start.justify-evenly.md\\:justify-between.text-center');
        const quartos = detailsContainer.find('p:contains("dorms")').first().text().trim();
        const banheiros = detailsContainer.find('p:contains("banheiros")').first().text().trim();
        const garagem = detailsContainer.find('p:contains("vagas")').first().text().trim();
        const areaUtil = detailsContainer.find('p:contains("privativos")').first().text().trim();
        
        const detailProperty = {
            id: code123i,
            titulo: titulo,
            descricao: descricao,
            quartos: quartos.replace(/\D/g, ''),
            banheiros: banheiros.replace(/\D/g, ''),
            vagas_garagem: garagem.replace(/\D/g, ''),
            areaUtil: areaUtil.replace(/\D/g, ''),
        }
    
        return detailProperty;
        
        
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn(`Link não encontrado (404): ${link}`);
        } else {
            console.error('Error ao extrair detalhes do link:', error);
        }
        return null;
    }
}

async function fetchLinks(base_url, portalNome, page) {
    try {
        const url_aluguel = `${base_url}/imoveis/aluga/em-sao-paulo-sp?page=${page}`
        // Axios retornava sempre o HTML da primeira página
        // Não importando se o valor de ${page} fosse maior que um
        // Então foi necessário usar o Selenium para capturar o conteúdo correto das páginas subsequentes
        const html = await fetchPageContent(url_aluguel);
        const $ = cheerio.load(html);

        const mainDiv = $('div.flex.w-full.flex-wrap.mb-4.mt-4.justify-between');
        const divs = mainDiv.find('div.relative.cursor-pointer');
        let properties = [];
        for (let i = 0; i < divs.length; i++) {
            const element = divs[i];
            const link = $(element).find('a').attr('href');
            if (link) {
                const linkCompleted = `${base_url}${link}`;

                const section = $(element).find('a > section');
                const preco = section.find('div#price h2').text();
                const endereco = section.find('div.flex.text-sm.justify-start.text-foxter-brand-900')
                                .last().text().trim();
                const sectionProperty = {
                    portal: portalNome,
                    url: linkCompleted,
                    tipoNegocio: 'Aluguel',
                    endereco: endereco,
                    pagina: page,
                    preco: formatPriceValue(preco),
                    capturado_em: new Date().toISOString(),
                    atualizado_em: new Date().toISOString()
                }

                const detailProperty = await extractDetails(linkCompleted);
                if (detailProperty) {
                    const combinedProperties = {...sectionProperty, ...detailProperty}
                    properties.push(combinedProperties);
                }
                
            }
        }
        return properties;
    } catch (error) {
        console.error('Error ao buscar conteúdo:', error);
    }
}

export async function fetchMultiplePagesImoveis(base_url, portalNome, numeroDePaginas) {
    try {
        let allResults = [];
        for (let pagina = 1; pagina <= numeroDePaginas; pagina++) {
            const properties = await fetchLinks(base_url, portalNome, pagina);
            allResults = allResults.concat(properties);
        }
        return allResults;
    } catch (error) {
        console.error('Erro ao coletar imoveis:', error);
        throw error;
    }
}
