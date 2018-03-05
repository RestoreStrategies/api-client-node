'use strict';

const Lab = require('lab');
const Code = require('code');
const Client = require('../client.js');
let apiClient;
let key;

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const beforeEach = lab.beforeEach;
const expect = Code.expect;

describe('Key', () => {

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

    beforeEach((done) => {

        apiClient.admin.users.keys.list(1).then((result) => {

            key = result.data[result.data.length - 1];
            done();
        });
    });

    it('creates credentials', (done) => {

        const text = 'Made at ' + Date.now();

        const template = {
            template: {
                data: [
                    { name: 'description', value: text },
                    { name: 'active', value: true }
                ]
            }
        };

        apiClient.admin.users.keys.create(
            1,
            template
        ).then((result) => {

            expect(result.data[0].description).to.equal(text);
            done();
        });
    });

    it('lists credentials', (done) => {

        apiClient.admin.users.keys.list(1).then((result) => {

            expect(result.data.length).to.be.above(7);
            done();
        });
    });

    it('deactivates credentials', (done) => {

        apiClient.admin.users.keys.deactivate(1, key.id).then((result) => {

            expect(result.response.statusCode).to.equal(204);
            done();
        });
    });
});
