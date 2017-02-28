'use strict';

const Lab = require('lab');
const Code = require('code');
const Client = require('../client.js');
let apiClient;

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const expect = Code.expect;

describe('Search', () => {

    before((done) => {

        const token = process.env.TOKEN;
        const secret = process.env.SECRET;
        const host = 'http://' + process.env.HOST;
        const port = process.env.PORT;

        apiClient = new Client({
            token: token,
            secret: secret,
            host: host,
            port: port
        });
        done();
    });

    it('should do a blank search', (done) => {

        apiClient.search({}).then((result) => {

            expect(result.response.statusCode).to.deep.equal(200);
            expect(Array.isArray(result.data));
            expect(result.data).to.have.length(0);
            expect(result.error).to.be.null();
            done();
        });
    });

    it('should do a full text search', (done) => {

        const parameters = {
            q: 'foster care'
        };

        apiClient.search(parameters).then((result) => {

            expect(result.response.statusCode).to.deep.equal(200);
            expect(Array.isArray(result.data));
            expect(result.error).to.be.null();
            done();
        });
    });

    it('should do paramterized search', (done) => {

        const parameters = {
            region: ['South', 'Central'],
            issues: ['Education', 'Children/Youth']
        };

        apiClient.search(parameters).then((result) => {

            expect(result.response.statusCode).to.deep.equal(200);
            expect(Array.isArray(result.data));
            expect(result.error).to.be.null();
            done();
        });
    });


    it('should do paramterized & full text search', (done) => {

        const parameters = {
            q: 'foster care',
            region: ['South', 'Central'],
            issues: ['Education', 'Children/Youth']
        };

        apiClient.search(parameters).then((result) => {

            expect(result.response.statusCode).to.deep.equal(200);
            expect(Array.isArray(result.data));
            expect(result.error).to.be.null();
            done();
        });
    });
});
