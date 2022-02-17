const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const puppeteer = require('puppeteer')

app.use(cors());
app.use(express.static('files'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));


app.get('/', async function (req, res) {

    async function generatePDF() {

        //We start a new browser, without showing UI
        const browser = await puppeteer.launch({
            headless: true
        });
        const page = await browser.newPage();
        const url = 'https://reporting.antennesb.fr/';

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




});



// Le serveur ecoute sur le port 3022
app.set("port", process.env.PORT || 3001);

app.listen(app.get("port"), () => {
    console.log(`server on port ${app.get("port")}`);
});