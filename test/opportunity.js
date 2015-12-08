'use strict';

const Lab = require('lab');
const Code = require('code');
const Client = require('../client.js');
let apiClient;

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
//const afterEach = lab.afterEach;
const expect = Code.expect;

describe('Opportunity', () => {

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

    it('should GET an opportunity by id', (done) => {

        apiClient.opportunities.get(1).then((result) => {

            expect(result.response.statusCode).to.deep.equal(200);
            expect(result.error).to.be.null();
            done();
        }).catch((result) => {

            expect(result.response.statusCode).to.deep.equal(200);
            expect(result.error).to.be.null();
            done(result.error);
        });
    });

    it('should GET a list of all opportunities');
});
