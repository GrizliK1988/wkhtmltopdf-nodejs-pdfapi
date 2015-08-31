# wkhtmltopdf-nodejs-pdfapi

A library that allows to create pdf files from html using wkhtmltopdf tool.

# Requirements

To use this library you need:

- **wkhtmltopdf** with it's dependencies
- **nodejs**
- **wkhtmltopdf-nodejs-options-wrapper** npm package

If you are going to use **wkhtmltopdf-nodejs-pdfapi** on a machine with operating system without graphical shell, 
then you will need to install display server, for example - **xvfb**.

For your convenience **vagrant box** with all necessary software has been created. It can be downloaded here: ...

# API

PdfApi has following methods:

##createPdf(request: CreateRequest, outputFilePath: string): Promise
**CreateRequest** is a class from **wkhtmltopdf-nodejs-options-wrapper** package that wraps wkhtmltopdf options.
Method will start pdf creation command and return a promise.

If pdf is generated successfully, then promise will be resolved with **(data, debug)** parameters, where **data** is the last
output and **debug** is a full output from wkhtmltopdf. **debug** will exist only if debug mode is enabled in **request**.

If pdf generation failed, then promise will be rejected with **(data, debug)** parameters, where **data** is an error
description.

##deletePdf(filePath: string): Promise
Method will start pdf deletion command and return a promise.
If pdf is deleted successfully, then promise will be resolved without arguments, otherwise it will be rejected with 
**error** parameter.

# Usage

```
var wkhtmlToPdfOptions = require('wkhtmltopdf-nodejs-options-wrapper'),
    PdfApi = require('./index');

var pdfApi = new PdfApi(),
    request = new wkhtmlToPdfOptions.CreateRequest(),
    page = new wkhtmlToPdfOptions.Page();

//let's generate pdf from google.com
page.setInput('http://google.com');
request.addPage(page);
request.setDebug(true); //we want to see all wkhtmltopdf output

pdfApi.createPdf(request, 'google.pdf')
    .then(function(data, debug) {
        console.log('Pdf is generated!');
    }, function(data, debug) {
        console.log('Houston, we have a problem: ' + data);
    });

//after some time we can delete pdf
pdfApi.deletePdf('google.pdf').then(function() {
    console.log('Pdf is deleted');
}, function(error) {
    console.log('Something went wrong: ' + error);
});
```

PdfApi is used in **wkhtmltopdf-nodejs-ws-server** package.

# Running tests

To run unit tests you can use **npm test** command.