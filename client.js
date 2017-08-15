'use strict';

const Hawk = require('hawk');
const Request = require('request');
const CollectionUtil = require('./lib/collection+json.js');
let that;

class Client {
    /**
    * API client
    *
    * @constructor
    *
    * @param {hash} hash    The client's configuration. The hash must include a
    *                       token & secret.
    */
    constructor() {

        this.host = 'http://api.restorestrategies.org';
        this.port = 80;
        this.algorithm = 'sha256';

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
            this.token = arguments[0].token;
            this.secret = arguments[0].secret;

            if (arguments[0].host !== undefined) {
                this.host = arguments[0].host;
            }
            if (arguments[0].port !== undefined) {
                this.port = arguments[0].port;
            }
            if (arguments[0].algorithm !== undefined) {
                this.algorithm = arguments[0].algorithm;
            }
            if (arguments[0].debug !== undefined) {
                this.debug = arguments[0].debug;
            }
        }

        // Hawk credentials.
        this.credentials = {
            id: this.token,
            key: this.secret,
            algorithm: this.algorithm
        };

        this.server = this.host + ':' + this.port;

        // Generate the Hawk authorization header.
        this.generateHeader = function (path, verb, data) {

            let extString = null;

            if (data !== null && typeof data === 'object') {
                const keys = Object.keys(data);
                extString = '{' + keys[0] + ': \'' + data[keys[0]] + '\'';

                for (let i = 1; i < keys.length; ++i) {
                    extString += ', ' + keys[i] + ': \'' + data[i] + '\'';
                }

                extString += '}';
            }

            if (this.debug) {
                console.log('credentails used ', this.credentials);
            }
            return Hawk.client.header(path, verb,
                { credentials: this.credentials, ext: extString });

        };


        /**
         * Perform an API request
         *
         * @param {string} path The URL path to the requested resource
         *
         * @param {string} verb The HTTP verb of the request
         *
         * @param {json} json   (optional) The JSON request body
         *
         * @returns {promise}   A promise that resolves to an object which
         *                      contains an HTTP Response object (response), the
         *                      response body (data), and -- possibly -- a
         *                      client error (error).
         */
        this.apiRequest = function (path, verb, json) {

            const hawkHeader = this.generateHeader(path, verb);

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
                options.headers['content-type'] =
                                            'application/vnd.collection+json';
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
        this.paramsToString = function (params) {

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


        /**
         * Retrieve a single item from a Collection+JSON collection
         *
         * @param {string} path The URL path to the given item
         *
         * @returns {promise}   A promise that resolves to an object which
         *                      contains an HTTP Response object (response), the
         *                      response body (data), and -- possibly -- a
         *                      client error (error).
         */
        this.getItem = function (path) {

            const promise = new Promise((resolve, reject) => {

                this.apiRequest(path, 'GET', null).then((result) => {

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
        };


        this.objectifyItems = function (result, resolve, reject) {

            const status = result.response.statusCode.toString();
            result.data = JSON.parse(JSON.stringify(result.data));

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
        };


        /**
         * Retrieve an entire Collection+JSON collection
         *
         * @param {string} path The URL path to the collection
         *
         * @returns {promise}   A promise that resolves to an object which
         *                      contains an HTTP Response object (response), the
         *                      response body (data), and -- possibly -- a
         *                      client error (error).
         */
        this.listItems = function (path) {

            const promise = new Promise((resolve, reject) => {

                this.apiRequest(path, 'GET', null).then((result) => {

                    this.objectifyItems(result, resolve, reject);
                });
            });

            return promise;
        };


        /**
         * Make a POST request
         *
         * @param {string} path The URL path of the request
         *
         * @parah {hash} template   A valid Collection+JSON template
         *
         * @returns {promise}       A promise that resolves to a hash which
         *                          contains an HTTP Response object
         *                          (response), the response body (data),
         *                          and, possibly, a client error (error).
         *                          The promise rejects if it does not
         *                          receive a 2xx or 3xx response from the
         *                          server, it rejects with the same
         *                          response, data, & error keys in a hash.
         *
         */
        this.postData = function (path, template) {

            const promise = new Promise((resolve, reject) => {

                that.apiRequest(path, 'POST', template).then((result) => {

                    that.objectifyItems(result, resolve, reject);
                });
            });

            return promise;
        };

        that = this;
    };

    toString() {

        return this.credentials;
    };

    deconstructor() {

        delete this.credentials;
        delete this.host;
        delete this.port;
        delete this.server;
        delete this.algorithm;
        delete this.debug;
    };

    set setHost(newHost) {

        this.host = newHost;
        this.server = this.host + ':' + this.port;
    };

    set setPort(newPort) {

        this.port = newPort;
        this.server = this.host + ':' + this.port;
    };

    set setToken(newToken) {

        this.token = newToken;
        this.credentials.id = this.token;
    };

    set setSecret(newSecret) {

        this.secret = newSecret;
        this.credentials.key = this.secret;
    };

    get opportunities() {

        return {
            /**
            * Get an opportunity
            *
            * @param {integer} id           The id of the opportunity.
            *
            * @returns {promise} promise    A promise that resolves to result
            *                               hash which contains an HTTP Response
            *                               object (response), the opportunity
            *                               object (data), and, possibly, an
            *                               error (error).
            */
            get: function (id) {

                return that.getItem(that.server + '/api/opportunities/' + id);
            },


            /**
            * List all opportunities
            *
            * @returns {promise}    A promise that resolves to result hash
            * which contains an HTTP Response object (response), an array of
            * opportunity objects (data), and, possibly, an error (error).
            */
            list: function () {

                return that.listItems(that.server + '/api/opportunities');
            }
        };
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
    search(parameters) {

        const query = that.paramsToString(parameters);
        return that.listItems(that.server + '/api/search?' + query);
    };

    get signup() {

        return {
            /**
            * Get a signup template
            *
            * @param {integer} id   The id of an opportunity
            *
            * @returns {promise}    A promise that resolves to a hash which
            *                       contains an HTTP Response object (response),
            *                       the template if it exists (data), and,
            *                       possibly, a client error (error). The
            *                       promise rejects if it does not receive a 2xx
            *                       or 3xx response from the server, it rejects
            *                       with the same response, data, & error keys
            *                       in a hash.
            */
            template: function (id) {

                const path = that.server + '/api/opportunities/' +
                            id + '/signup';

                const promise = new Promise((resolve, reject) => {

                    that.apiRequest(path, 'GET', null).then((result) => {

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
             * Example:
             * {
             *  template: {
             *       data: [
             *           { name: 'givenName', value: 'Jon' },
             *           { name: 'familyName', value: 'Doe' },
             *           { name: 'telephone', value: '5124567890' },
             *           { name: 'email', value: 'jon.doe@example.com' },
             *           { name: 'comment', value: '' },
             *           { name: 'numOfItemsCommitted', value: 1 },
             *           { name: 'lead', value: 'other' }
             *       ]
             *  }
             * }
             *
             * @returns {promise}       A promise that resolves to a hash which
             *                          contains an HTTP Response object
             *                          (response), the response body (data),
             *                          and, possibly, a client error (error).
             *                          The promise rejects if it does not
             *                          receive a 2xx or 3xx response from the
             *                          server, it rejects with the same
             *                          response, data, & error keys in a hash.
             */
            submit: function (id, template) {

                const path = that.server + '/api/opportunities/' +
                        id + '/signup';

                return that.postData(path, template);
            }
        };
    };

    get organizations() {

        return {
            /**
             * Get an organization
             *
             * @param {integer} id  The id of the organization.
             *
             * @returns {promise}   A promise that resolves to an object which
             *                      contains an HTTP Response object (response),
             *                      the response body (data), and -- possibly --
             *                      a client error (error).
             */
            get: function (id) {

                return that.getItem(that.server + '/api/organizations/' + id);
            },


            /**
             * List all organizations
             *
             * @returns {promise}   A promise that resolves to an object which
             *                      contains an HTTP Response object (response),
             *                      the response body (data), and -- possibly --
             *                      a client error (error).
             */
            list: function () {

                return that.listItems(that.server + '/api/organizations');
            }

        };
    };

    get users() {

        return {
            /**
             * Get a user
             *
             * @param {integer} id  The id of the user.
             *
             * @returns {promise}   A promise that resolves to an object which
             *                      contains an HTTP Response object (response),
             *                      the response body (data), and -- possibly --
             *                      a client error (error).
             */
            get: function (id) {

                return that.getItem(that.server + '/api/admin/users/' + id);
            },


            /**
             * List all users
             *
             * @returns {promise}   A promise that resolves to an object which
             *                      contains an HTTP Response object (response),
             *                      the response body (data), and -- possibly --
             *                      a client error (error).
             */
            list: function () {

                return that.listItems(that.server + '/api/admin/users');
            },

            /**
             * Create an api user
             *
             * @param {hash} template   A valid Collection+JSON template.
             *
             * Example:
             * {
             *  template: {
             *       data: [
             *           { name: 'email', value: 'jon.doe@example.com' },
             *           { name: 'givenName', value: 'Jon' },
             *           { name: 'familyName', value: 'Doe' },
             *           { name: 'telephone', value: '5124567890' },
             *           { name: 'franchise_city', value: 'Austin' },
             *           { name: 'street_address', value: '105 Main Street' },
             *           { name: 'address_locality', value: 'Austin' },
             *           { name: 'address_region', value: 'Texas' },
             *           { name: 'postal_code', value: 78704 },
             *           { name: 'website', value: 'https://churchexample.com' },
             *           { name: 'uuid', value: 'dcca945c-79a0-45d1-9d73-010c2496a362' },
             *           { name: 'plan_level', value: 'Basic' },
             *           { name: 'church', value: 'Community Church' },
             *           { name: 'church_size', value: 4567 },
             *           { name: 'active', value: false }
             *       ]
             *  }
             * }
             * @returns {promise}       A promise that resolves to a hash which
             *                          contains an HTTP Response object
             *                          (response), the response body (data),
             *                          and, possibly, a client error (error).
             *                          The promise rejects if it does not
             *                          receive a 2xx or 3xx response from the
             *                          server, it rejects with the same
             *                          response, data, & error keys in a hash.
             */
            create: function (template) {

                const path = that.server + '/api/admin/users';
                return that.postData(path, template);
            },

            /**
             * Update an api user
             *
             * @param {integer} id      The id of the user.
             *
             * @param {hash} template   A valid Collection+JSON template. This
             *                          template has the same names & values as
             *                          users.create
             */
            update: function (id, template) {

                const path = that.server + '/api/admin/users/' + id;
                return that.postData(path, template);
            },

            keys: {
                /**
                 * Create an api key for a user
                 *
                 * @param {integer|string} id   The id or uuid of the user
                 *
                 * @param {hash} template       A valid Collection+JSON template
                 *
                 * Example:
                 * {
                 *  template: {
                 *      data: [
                 *          { name: 'description', value: 'The key I made' },
                 *          { name: 'active', value: true }
                 *      ]
                 *  }
                 * }
                 */
                create: function (id, template) {

                    const path = that.server + '/api/admin/users/' +
                            id + '/keys';

                    return that.postData(path, template);
                },
                update: function (id, token, template) {

                    const path = that.server + '/api/admin/users/' +
                            id + '/keys/' + token;

                    return that.postData(path, template);
                }
            }
        };
    };
};

module.exports = Client;
