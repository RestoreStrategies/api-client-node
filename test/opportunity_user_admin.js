'use strict';

const Lab = require('lab');
const Code = require('code');
const Client = require('../client.js');
let apiClient;

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

describe('Opportunity admin', () => {

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

    it('features an opportunity', (done) => {

        apiClient.admin.users.opportunities.feature(1, 1).then((result) => {

            expect(result.response.statusCode).to.deep.equal(204);
            done();
        });
    });

    it('allows admin to list featured opportunities for user', (done) => {

        apiClient.admin.users.opportunities.featured(1).then((result) => {

            expect(result.data.length).to.deep.equal(1);
            done();
        });
    });

    it('allows user to list their featured opportunities', (done) => {

        apiClient.opportunities.featured().then((result) => {

            expect(result.data.length).to.deep.equal(1);
            done();
        });
    });

    it('removes a featured opportunities', (done) => {

        apiClient.admin.users.opportunities.unfeature(1, 1).then((result) => {

            expect(result.response.statusCode).to.deep.equal(204);
            done();
        });
    });
});
