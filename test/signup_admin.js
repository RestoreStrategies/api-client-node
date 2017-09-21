'use strict';

const Lab = require('lab');
const Code = require('code');
const Client = require('../client.js');
let apiClient;

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('Signup admin', () => {

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

    it('lists signups associated with an API user', (done) => {

        apiClient.admin.users.signups.list(1).then((result) => {

            expect(result.data.length).to.be.above(3);
            expect(result.data[0].church).to.equal('Test Church Name');
            done();
        });
    });
});
