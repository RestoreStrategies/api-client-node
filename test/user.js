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

describe('User', () => {

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

    it('should GET a user by id', (done) => {

        apiClient.users.get(1).then((result) => {

            expect(result.response.statusCode).to.deep.equal(200);
            expect(result.data.id).to.equal('1');
            expect(result.error).to.be.null();
            done();
        });
    });

    it('should handle a non-existent user', (done) => {

        apiClient.users.get(10000).catch((result) => {

            const collection = result.data.collection;

            expect(result.response.statusCode).to.deep.equal(404);
            expect(collection.error.title).to.equal('Not found');
            expect(collection.error.code).to.equal(404);
            expect(result.error).to.be.null();
            done();
        });
    });

    it('should GET a list of all users');

    it('should create a user');
});
