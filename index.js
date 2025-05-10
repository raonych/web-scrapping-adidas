const puppeteer = require('puppeteer');
const fs = require("fs");
const URL = 'https://www.adidas.com.br/calcados';


(async ()=>{

    const browser = await puppeteer.launch({headless:false});

    const page = await browser.newPage();

    await page.goto(URL,{ waitUntil: "domcontentloaded" });


    //fechando modal de cookies
    await page.waitForSelector('[id="gl-modal__main-content-"]');
    await page.click('[id="glass-gdpr-default-consent-accept-button"]');
    
    const shoes = [];
    
    while(true){
        
        //espera pelo modal de portal de conta, se renderizar ele fechar se não continua
        try{
            await page.waitForSelector('[id="gl-modal__mf-account-portal"]',{
                timeout: 5000
            });
            await page.click('[name="account-portal-close"]');
            console.log("fechando modal de conta")
        }catch(error){
            console.log("modal não encontrado")
        } 

        //espera pela renderização da lista de produtos
        await page.waitForSelector('[data-testid="product-grid"]');

        //seleciona a card do produto e extrai os dados
        const products = await page.$$eval('[data-testid="plp-product-card"]',products => products.map((product) =>{
        const name = product.querySelector('[data-testid="product-card-title"]')?.textContent.trim() || null;    
        const imageUrl = product.querySelector('img')?.src || null;
        const price = product.querySelector('[data-testid="main-price"]')?.textContent.trim() || null;
        const category = product.querySelector('[data-testid="product-card-subtitle"]')?.textContent.trim() || null;

        
            return {name,price,imageUrl,category}
            
        })
        );

        console.log("produtos nesta pagina", products.length);
        //passa os dados de uma pagina para array principal
        for(let i = 0; i < products.length; i++){
            shoes.push(products[i])
        } 
        //passa a pagina se encontrar o botão, se não finaliza o loop
        try{
            await page.click('[data-testid="pagination-next-button"]')
            console.log("proxima pagina")
        }catch(error){
            console.log('finalizando loop')
            break
            
        }
    }
    //salva o array principal para um arquivo
    fs.writeFileSync("shoes_data.json", JSON.stringify(shoes, null, 2), "utf-8");



    await browser.close();
    console.log(shoes.length)

})();