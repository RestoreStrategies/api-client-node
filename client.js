'use strict';

const Hawk = require('hawk');
const Request = require('request');
const CollectionUtil = require('./lib/collection+json.js');

/**
* API client
*
* @constructor
*
* @param {hash} hash    The client's configuration. The hash must include a
* token & secret.
*/
const Client = function () {

    let token;
    let secret;
    let host = 'http://api.restorestrategies.org';
    let port = 80;
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


    const apiRequest = function (path, verb, json) {

        const hawkHeader = generateHeader(path, verb);

        const options = {
            uri: path,
            method: verb,
            headers: {
                Authorization: hawkHeader.field,
                'api-version': 1,
                'Accept': 'application/vnd.collection+json'
            }
        };

        if (json) {
            options.headers['content-type'] = 'application/vnd.collection+json';
            options.json = json;
        }

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
    * Take a hash & turn it into a URL query string
    *
    * @param {hash} params              A hash of query keys & values
    *
    * @returns {string} querystring     A valid URL query string
    *
    *
    * Example
    *
    * paramsToString({
    *       q: 'foster care',
    *       region: ['South', 'Central'],
    *       issues: ['Education', 'Children/Youth']
    * })
    *
    * Returns:
    * 'q=foster%20care&region[]=South&region[]=Central&issues[]=Education&issues[]=Children%2FYouth'
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
        * Get an opportunity
        *
        * @param {integer} id           The id of the opportunity.
        *
        * @returns {promise} promise    A promise that resolves to result hash
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

                        CollectionUtil.validateCollection(result.data).
                        then((jsonCollection) => {

                            const items = CollectionUtil.
                                          objectifyCollection(jsonCollection);

                            result.data = items[0];

                            resolve(result);
                        }).catch((err) => {

                            console.log(err);
                            resolve(result);
                        });
                    }
                    else {
                        reject(result);
                    }

                });
            });

            return promise;
        },


        /**
        * List all opportunities
        *
        * @returns {promise}    A promise that resolves to result hash
        * which contains an HTTP Response object (response), an array of
        * opportunity objects (data), and, possibly, an error (error).
        */
        list: function () {

            const path = host + ':' + port + '/api/opportunities';

            const promise = new Promise((resolve, reject) => {

                apiRequest(path, 'GET', null).then((result) => {

                    const status = result.response.statusCode.toString();
                    result.data = JSON.parse(result.data);

                    // Check for 200 or 300 status codes.
                    if (status[0] === '2' || status[0] === '3') {
                        CollectionUtil.validateCollection(result.data).
                        then((jsonCollection) => {

                            const items = CollectionUtil.
                                          objectifyCollection(jsonCollection);

                            result.data = items;
                            resolve(result);
                        }).catch((err) => {

                            resolve(result);
                        });

                    }
                    else {
                        reject(result);
                    }
                });
            });

            return promise;
        }
    };


    /**
    * Search opporunities
    *
    * @param {hash} parameters      A hash of search parameters. The hash should
    * conform to the below Collection+JSON query template:
    *
    * {
    *     href: '/api/search',
    *     rel: 'search',
    *     prompt: 'Search for opportunities',
    *     data: [
    *         {
    *             name: 'q',
    *             prompt: '(optional) Enter search string',
    *             value: ''
    *         },
    *         {
    *             name: 'issues',
    *             prompt: '(optional) Select 0 or more issues',
    *             array: [
    *                 'Children/Youth',
    *                 'Elderly',
    *                 'Family/Community',
    *                 'Foster Care/Adoption',
    *                 'Healthcare',
    *                 'Homelessness',
    *                 'Housing',
    *                 'Human Trafficking',
    *                 'International/Refugee',
    *                 'Job Training',
    *                 'Sanctity of Life',
    *                 'Sports',
    *                 'Incarceration'
    *           ]
    *       },
    *       {
    *           name: 'regions',
    *           prompt: '(optional) Select 0 or more geographical regions',
    *           array: [
    *               'North',
    *               'Central',
    *               'East',
    *               'West',
    *               'Other'
    *           ]
    *       },
    *       {
    *           name: 'times',
    *           prompt: '(optional) Select 0 or more times of day',
    *           array: [
    *               'Morning',
    *               'Mid-Day',
    *               'Afternoon',
    *               'Evening'
    *           ]
    *       },
    *       {
    *           name: 'days',
    *           prompt: '(optional) Select 0 or more days of the week',
    *           array: [
    *               'Monday',
    *               'Tuesday',
    *               'Wednesday',
    *               'Thursday',
    *               'Friday',
    *               'Saturday',
    *               'Sunday'
    *           ]
    *        },
    *        {
    *            name: 'type',
    *            prompt: '(optional) Select 0 or more opportunity types',
    *            array: [
    *                'Gift',
    *                'Service',
    *                'Specific Gift',
    *                'Training'
    *            ]
    *        },
    *        {
    *            name: 'group_types',
    *            prompt: '(optional) Select 0 or more volunteer group types',
    *            array: [
    *                'Individual',
    *                'Group',
    *                'Family'
    *            ]
    *        }
    *   ]
    * }
    *
    * Example: parameters = {
    *                   q: 'foster care',
    *                   region: ['South, 'Central'],
    *                   issues: ['Education', 'Children/Youth']
    *          }
    *
    *
    * @returns {promise} promise    A promise that resolves to a result hash
    * which contains an HTTP Response object (response), an array of
    * opportunity objects (data), and, possibly, an error (error).
    */
    this.search = function (parameters) {

        const query = paramsToString(parameters);

        const path = host + ':' + port + '/api/search?' + query;

        const promise = new Promise((resolve, reject) => {

            apiRequest(path, 'GET', null).then((result) => {

                const status = result.response.statusCode.toString();
                result.data = JSON.parse(result.data);

                if (status[0] === '2' || status[0] === '3') {
                    CollectionUtil.validateCollection(result.data).
                    then((jsonCollection) => {

                        const items = CollectionUtil.
                                      objectifyCollection(jsonCollection);
                        result.data = items;
                        resolve(result);
                    }).catch((err) => {

                        resolve(result);
                    });
                }
                else {
                    reject(result);
                }
            });
        });

        return promise;
    };

    this.signup = {
        /**
        * Get a signup template
        *
        * @param {integer} id   The id of an opportunity
        *
        * @returns {promise}    A promise that resolves to a hash which contains
        * an HTTP Response object (response), the template if it exists (data),
        * and, possibly, a client error (error). The promise rejects if it does
        * not receive a 2xx or 3xx response from the server, it rejects with the
        * same response, data, & error keys in a hash.
        */
        template: function (id) {

            const path = host + ':' + port + '/api/opportunities/' +
                            id + '/signup';

            const promise = new Promise((resolve, reject) => {

                apiRequest(path, 'GET', null).then((result) => {

                    const status = result.response.statusCode.toString();
                    result.data = JSON.parse(result.data);

                    if (status[0] === '2' || status[0] === '3') {

                        CollectionUtil.validateCollection(result.data).
                        then((collection) => {

                            result.data = result.data.collection.template;
                            resolve(result);
                        }).catch((err) => {

                            console.log(err);
                            resolve(result);
                        });
                    }
                    else {
                        reject(result);
                    }
                });
            });

            return promise;
        },

        /**
         * Submit a signup
         *
         * @param {integer}    id   The id of an opportunity
         *
         * @param {hash} template   A valid Collection+JSON template.
         * Example:  {
         *              template: {
         *                  data: [
         *                      { name: 'givenName', value: 'Jon' },
         *                      { name: 'familyName', value: 'Doe' },
         *                      { name: 'telephone', value: '5124567890' },
         *                      { name: 'email', value: 'jon.doe@example.com' },
         *                      { name: 'comment', value: '' },
         *                      { name: 'numOfItemsCommitted', value: 1 },
         *                      { name: 'lead', value: 'other' }
         *                  ]
         *              }
         *          }
         *
         * @returns {promise}       A promise that resolves to a hash which
         * contains an HTTP Response object (response), the response body
         * (data), and, possibly, a client error (error). The promise rejects if
         * it does not receive a 2xx or 3xx response from the server, it rejects 
         * with the same response, data, & error keys in a hash.
         */
        submit: function (id, template) {

            const path = host + ':' + port + '/api/opportunities/' +
                         id + '/signup';

            const promise = new Promise((resolve, reject) => {

                apiRequest(path, 'POST', template).then((result) => {

                    const status = result.response.statusCode.toString();

                    //console.log('request made', result.data);
                    //result.data = JSON.parse(result.data);

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
};

module.exports = Client;
