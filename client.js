'use strict';

const Hawk = require('hawk');
const Request = require('request');

const Client = function () {

    let token;
    let secret;
    let host = 'https://api.forthecity.org';
    let port = 443;
    let algorithm = 'sha256';

    if (arguments.length !== 1) {
        throw {
            name: 'ArgumentError',
            message: 'Wrong number of arguments'
        };
    }
    else if (typeof arguments[0] !== 'object') {
        throw {
            name: 'ArgumentError',
            message: 'Argument is not an object'
        };
    }
    else {
        token = arguments[0].token;
        secret = arguments[0].secret;

        if (arguments[0].host !== undefined) {
            host = arguments[0].host;
        }
        if (arguments[0].port !== undefined) {
            port = arguments[0].port;
        }
        if (arguments[0].algorithm !== undefined) {
            algorithm = arguments[0].algorithm;
        }
    }

    // Hawk credentials.
    const credentials = {
        id: token,
        key: secret,
        algorithm: algorithm
    };

    this.toString = function () {

        return credentials;
    };

    // Generate the Hawk authorization header.
    const generateHeader = function (path, verb, data) {

        return Hawk.client.header(path, verb,
            { credentials: credentials, ext: data });

    };

    const apiRequest = function (path, verb, data) {

        const hawkHeader = generateHeader(path, verb, data);

        const options = {
            uri: path,
            method: verb,
            headers: {
                Authorization: hawkHeader.field,
                api_version: 1
            }
        };

        const promise = new Promise((resolve, reject) => {

            Request(options, (error, response, body) => {

                resolve({
                    error: error,
                    response: response,
                    body: body
                });
            });
        });

        return promise;
    };

    this.opportunities = {
        show: function (id) {

            const path = host + ':' + port + '/api/opportunities/' + id;

            const promise = new Promise((resolve, reject) => {

                apiRequest(path, 'GET', null).then((result) => {

                    const status = result.response.statusCode.toString();

                    // Check for 200 or 300 status codes.
                    if (status[0] === '2' || status[0] === '3') {
                        resolve(result.response);
                    }
                    else {
                        reject({
                            error: result.error,
                            response: result.response
                        });
                    }
                });
            });

            return promise;
        }
    };

    this.signup = {};

    this.search = {};
};

module.exports = Client;
