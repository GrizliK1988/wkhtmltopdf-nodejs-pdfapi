var spawn = require('child_process').spawn,
    Promise = require('promise'),
    fs = require('fs');

var PdfApi = function(displayServer, displayServerParameterList) {
    this.displayServer = displayServer;
    this.displayServerParameterList = displayServerParameterList || [];
};

PdfApi.prototype = {
    createPdf: function(request, outputFilePath) {
        var pdfCommandParts = request.toString().split(' ').filter(function(value) {
                return value !== '';
            }),
            commandParts = ['wkhtmltopdf'].concat(pdfCommandParts),
            displayServerCommandParts = [],
            debug = [];

        if (this.displayServer) {
            displayServerCommandParts.push(this.displayServer);
        }
        displayServerCommandParts = displayServerCommandParts.concat(this.displayServerParameterList);

        commandParts = displayServerCommandParts.concat(commandParts);
        commandParts.push(outputFilePath);

        var command = spawn(commandParts[0], commandParts.slice(1));

        return new Promise(function(resolve, reject) {
            var onDataOutput = function(data) {
                if (data) {
                    debug.push(data.toString());
                }
                if (data.toString().match(/^Exit with code.*due to.*error/)) {
                    reject(data, debug);
                }
                if (data.toString().trim() === 'Done') {
                    resolve(data, debug);
                }
            };

            command.stdout.on('data', onDataOutput);
            command.stderr.on('data', onDataOutput);

            command.on('close', function () {
                reject('Pdf has not been created. See debug output for more details', debug);
            });
        }.bind(this));
    },


    deletePdf: function(filePath) {
        /* istanbul ignore next */
        return new Promise(function(resolve, reject) {
            fs.unlink(filePath, function(error) {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            }.bind(this));
        });
    }
};

module.exports = PdfApi;
