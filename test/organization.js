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

describe('Organization', () => {

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


    it('should GET an organization by id', (done) => {

        apiClient.organizations.get(2).then((result) => {

            expect(result.response.statusCode).to.deep.equal(200);
            expect(result.data.id).to.equal('2');
            expect(result.error).to.be.null();
            done();
        });
    });


    it('should handle a non-existent organization', (done) => {

        apiClient.organizations.get(10000).catch((result) => {

            const collection = result.data.collection;

            expect(result.response.statusCode).to.deep.equal(404);
            expect(collection.error.title).to.equal('Not found');
            expect(collection.error.code).to.equal(404);
            expect(result.error).to.be.null();
            done();
        });
    });


    it('should GET a list of all organizations', (done) => {

        apiClient.organizations.list().then((result) => {

            expect(result.response.statusCode).to.deep.equal(200);
            expect(result.data[0].id).to.equal('3');
            expect(result.error).to.be.null();
            done();
        });
    });
});
