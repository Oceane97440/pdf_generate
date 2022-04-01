const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const puppeteer = require('puppeteer')
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');

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

        const setCustomOptions = (htmlToPDFOperation) => {
            // Define the page layout, in this case an 8 x 11.5 inch page (effectively portrait orientation).
            const pageLayout = new PDFServicesSdk.CreatePDF.options.html.PageLayout();
            pageLayout.setPageSize(20, 25);

            // Set the desired HTML-to-PDF conversion options.
            const htmlToPdfOptions = new PDFServicesSdk.CreatePDF.options.html.CreatePDFFromHtmlOptions.Builder()
                .includesHeaderFooter(true)
                .withPageLayout(pageLayout)
                .build();
            htmlToPDFOperation.setOptions(htmlToPdfOptions);
        };

        // Initial setup, create credentials instance.
        const credentials = PDFServicesSdk.Credentials
            .serviceAccountCredentialsBuilder()
            .fromFile("pdfservices-api-credentials.json")
            .build();

        // Create an ExecutionContext using credentials and create a new operation instance.
        const executionContext = PDFServicesSdk.ExecutionContext.create(credentials),
            createPDF = PDFServicesSdk.CreatePDF,
            htmlToPDFOperation = createPDF.Operation.createNew();

        // Set operation input from a source URL.
        const input = PDFServicesSdk.FileRef.createFromURL(
            "https://developer.adobe.com/document-services/docs/overview/"
        );
        htmlToPDFOperation.setInput(input);

        // Provide any custom configuration options for the operation.
        setCustomOptions(htmlToPDFOperation);

        // Execute the operation and Save the result to the specified location.
        htmlToPDFOperation.execute(executionContext)
        .then(result => {
            result.saveAsFile('output/bilan_campagne.pdf')
            console.log(result)
            res.send('ok')

        }).catch(err => {
                if (err instanceof PDFServicesSdk.Error.ServiceApiError ||
                    err instanceof PDFServicesSdk.Error.ServiceUsageError) {
                    console.log('Exception encountered while executing operation', err);
                } else {
                    console.log('Exception encountered while executing operation', err);
                }
            });

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



// Le serveur ecoute sur le port 3022
app.set("port", process.env.PORT || 3001);

app.listen(app.get("port"), () => {
    console.log(`server on port ${app.get("port")}`);
});