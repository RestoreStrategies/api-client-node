'use strict';

const Lab = require('lab');
const Code = require('code');
const Client = require('../client.js');
let apiClient;

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('Organization admin', () => {

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

    it('lists organizations allowed by an API user', (done) => {

        apiClient.admin.users.organizations.list(1).then((result) => {

            expect(result.data.length).to.be.above(1);
            done();
        });
    });
});
