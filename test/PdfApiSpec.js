var mockery = require('mockery'),
    CreateRequest = require('wkhtmltopdf-nodejs-options-wrapper').CreateRequest,
    Promise = require('promise');

function getSpawnMock(eventHandlers) {
    return {
        spawn: function() {
            return {
                stdout: {
                    on: function(event, callback) {
                        eventHandlers['stdout.' + event] = callback;
                    }
                },
                stderr: {
                    on: function(event, callback) {
                        eventHandlers['stderr.' + event] = callback;
                    }
                },
                on: function(event, callback) {
                    eventHandlers[event] = callback;
                }
            };
        }
    };
}

describe('PdfApi unit tests', function() {
    beforeEach(function() {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });
        mockery.deregisterMock('child_process');
    });

    afterEach(function() {
        mockery.deregisterMock('child_process');
        mockery.disable();
    });

    it('tests pdf creation', function(done) {
        var self = this,
            eventHandlers = {},
            spawnMock = getSpawnMock(eventHandlers);

        spyOn(spawnMock, 'spawn').andCallThrough();
        mockery.registerMock('child_process', spawnMock);

        var PdfApi = require('../index'),
            pdfApi = new PdfApi(),
            rejectCallCount = 0;

        pdfApi.createPdf(new CreateRequest(), 'test.pdf').then(function() {
            self.fail('Command closing without output is an error');
        }, function() {
            rejectCallCount++;
            expect(rejectCallCount).toBe(1);
        });
        expect(spawnMock.spawn).toHaveBeenCalled();

        eventHandlers['close']();
        eventHandlers['close']();

        pdfApi.createPdf(new CreateRequest(), 'test.pdf').then(function() {
            self.fail('Wkhtmltopdf error was not handled');
        }, function() {
        });
        eventHandlers['stderr.data']('Exit with code 1 due to http error');

        pdfApi.createPdf(new CreateRequest(), 'test.pdf').then(function() {
            self.fail('Wkhtmltopdf error was not handled');
        }, function() {
        });
        eventHandlers['stdout.data']('Exit with code 1 due to http error');

        pdfApi.createPdf(new CreateRequest(), 'test.pdf').then(function() {
        }, function(data ,debug) {
            expect(debug[0]).toBe('Some message');
            expect(debug[1]).toBe('Done');
            expect(data).toBe('Done');

            self.fail('Pdf has to be generated successfully');
        });
        eventHandlers['stdout.data']('Some message');
        eventHandlers['stdout.data']('');
        eventHandlers['stdout.data']('Done');

        setTimeout(done, 5);
    });
});