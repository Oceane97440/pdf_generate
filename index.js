const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const puppeteer = require('puppeteer')
//const puppeteer_extra = require('puppeteer-extra')
//const puppeteer_proxy = require('puppeteer-proxy')
//const proxyRequest = require('puppeteer-proxy')
//const puppeteer = require('zyte-smartproxy-puppeteer');

app.use(cors());
app.use(express.static('files'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));


app.get('/', async function (req, res) {

    try {
        async function generatePDF() {

            //We start a new browser, without showing UI
            const browser = await puppeteer.launch({
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--single-process"

                ],
            });
            const page = await browser.newPage();
            const url = 'https://reporting.antennesb.fr/';
            res.setHeader("Content-Type", "application/pdf");

            //We load the page, one of my blog post (networkidle0 means we're waiting for the network to stop making new calls for 500ms
            await page.goto(url, {
                waitUntil: 'networkidle0'
            });



            //Let's generate the pdf and close the browser
            const pdf = await page.pdf({
                path: "article.pdf",
                format: 'A4'
            });
            await browser.close();
            return res.send(pdf);
        }

        generatePDF();
    } catch (error) {
        res.send(`❌ Error: ${error.message}`);
    }






});

app.get('/export', async function (req, res) {


    // add stealth plugin and use defaults (all evasion techniques)
    const StealthPlugin = require('puppeteer-extra-plugin-stealth')
    puppeteer_extra.use(StealthPlugin())

    // puppeteer usage as normal
    puppeteer_extra.launch({
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--single-process"

        ],
    }).then(async browser => {
        console.log('Running tests..')
        const page = await browser.newPage()
        await page.goto('https://reporting.antennesb.fr/')
        await page.waitForTimeout(5000)
        const pdf = await page.pdf({
            path: 'testresult.pdf',
            fullPage: true
        })
        await browser.close()
        res.send(pdf)
    })




});


app.get('/proxy', async function (req, res) {

    try {

      
      

        (async () => {
            const browser = await puppeteer.launch({
                ignoreHTTPSErrors: true,
                headless: false,
                args: [
                    '--proxy-server=https://generate-filepdf.herokuapp.com/'
                ]
            });
            const page = await browser.newPage({
                ignoreHTTPSErrors: true
            });

            console.log('Opening page ...');
            try {

                await page.goto('https://toscrape.com/', {timeout: 180000});
            } catch (err) {
                console.log(err);
            }

            console.log('Taking a screenshot ...');
            /*const pdf = await page.pdf({
                path: "article.pdf",
                format: 'A4'
            });*/
           const pdf = await page.screenshot({path: 'screenshot.png'});

            await browser.close();
            return res.send(pdf);

        })();

    } catch (error) {
        res.send(`❌ Error: ${error.message}`);
    }






});

// Le serveur ecoute sur le port 3022
app.set("port", process.env.PORT || 3001);

app.listen(app.get("port"), () => {
    console.log(`server on port ${app.get("port")}`);
});