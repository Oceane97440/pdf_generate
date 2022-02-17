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

   
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://reporting.antennesb.fr/', {
      waitUntil: 'networkidle2',
    });
  const pdf = await page.pdf({ path: 'testPDF.pdf', format: 'a4' });
  
    await browser.close();
    res.send(pdf)
});



// Le serveur ecoute sur le port 3022
app.set("port", process.env.PORT || 3001);

app.listen(app.get("port"), () => {
    console.log(`server on port ${app.get("port")}`);
});
