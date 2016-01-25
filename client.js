'use strict';

const Hawk = require('hawk');
const Request = require('request');

/**
* API client
*
* @constructor
*
* @param {hash} hash -- The client's configuration. The hash must include a
* token & secret.
*/
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

        let extString = null;

        if (data !== null && typeof data === 'object') {
            const keys = Object.keys(data);
            extString = '{' + keys[0] + ': \'' + data[keys[0]] + '\'';

            for (let i = 1; i < keys.length; ++i) {
                extString += ', ' + keys[i] + ': \'' + data[i] + '\'';
            }

            extString += '}';
        }

        return Hawk.client.header(path, verb,
            { credentials: credentials, ext: extString });

    };

    const apiRequest = function (path, verb, data) {

        const hawkHeader = generateHeader(path, verb, data);

        const options = {
            uri: path,
            method: verb,
            headers: {
                Authorization: hawkHeader.field,
                'api-version': 1
            }
        };

        const promise = new Promise((resolve, reject) => {

            Request(options, (error, response, body) => {

                resolve({
                    response: response,
                    data: body,
                    error: error
                });
            });
        });

        return promise;
    };

    /**
    * Takes a hash & turns it into a URL query string.
    */
    const paramsToString = function (params) {

        /**
        * Takes in a key & value, returns a URL escaped string in URL query
        * format.
        */
        const _parameterize = function (key, value) {

            return key + '=' + encodeURIComponent(value);
        };

        const queryArray = [];

        if (typeof params !== 'object') {
            return null;
        }

        const keys = Object.keys(params);

        if (keys.length < 1) {
            return queryString;
        }

        for (let i = 0; i < keys.length; ++i) {

            if (Array.isArray(params[keys[i]])) {
                for (let j = 0; j < params[keys[i]].length; ++j) {
                    queryArray.push(_parameterize(keys[i] + '[]',
                                                  params[keys[i]][j]));
                }
            }
            else {
                queryArray.push(_parameterize(keys[i], params[keys[i]]));
            }
        }

        return queryArray.join('&');
    };

    this.opportunities = {

        /**
        * Gets an opportunity based on id
        *
        * @param {integer} id -- The id of the opportunity.
        *
        * @returns {promise} promise -- A promise that resolves to result hash
        * which contains an HTTP Response object (response), the opportunity
        * object (data), and, possibly, an error (error).
        */
        get: function (id) {

            const path = host + ':' + port + '/api/opportunities/' + id;

            const promise = new Promise((resolve, reject) => {

                apiRequest(path, 'GET', null).then((result) => {

                    const status = result.response.statusCode.toString();
                    result.data = JSON.parse(result.data);

                    // Check for 200 or 300 status codes.
                    if (status[0] === '2' || status[0] === '3') {
                        resolve(result);
                    }
                    else {
                        reject(result);
                    }
                });
            });

            return promise;
        },

        list: function (page) {

            const path = host + ':' + port + '/api/opportunities';

            const promise = new Promise((resolve, reject) => {

                apiRequest(path, 'GET', null).then((result) => {

                    const status = result.response.statusCode.toString();
                    result.data = JSON.parse(result.data);

                    // Check for 200 or 300 status codes.
                    if (status[0] === '2' || status[0] === '3') {
                        resolve(result);
                    }
                    else {
                        reject(result);
                    }
                });
            });

            return promise;
        }
    };

    this.search = function (parameters) {

        const query = paramsToString(parameters);

        const path = host + ':' + port + '/api/search?' + query;

        const promise = new Promise((resolve, reject) => {

            apiRequest(path, 'GET', null).then((result) => {

                result.data = JSON.parse(result.data);
                resolve(result);
            });
        });

        return promise;
    };

    this.signup = {};
};

module.exports = Client;
