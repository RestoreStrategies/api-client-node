# For the City API client

This is a Node.js cliet for the For the City Network's API. The API allows clients to view, filter, search & sign up for volunteer opportunities.

## Initializing

To use the API you need valid credentials. An instance of the API client requires a user token & secret.

```javascript
const Client = require('forthecity-client');

const apiClient = new Client({ token: <a_user_token>, secret: <a_user_secet>});
```

## Returned values

This client returns promises which resolve into hashes with 3 keys:

* response: the full [Request](https://www.npmjs.com/package/request) response object
* data: the HTTP body
* error: a [Request](https://www.npmjs.com/package/request) error, this is normally null

## Viewing Opportunities

It is possible to view opportunities individually or all at once.

```javascript
// Gets the opportunity that has an id of 10.
apiClient.opportunities.get(10).then((opp) => {

    console.log(opp.data);
});

// Gets a list of all the opportunities
apiClient.opportunities.list().then((opps) => {

    console.log(opps.data);
});
```

## Search

The search function takes a hash with any or all of the following keys.

* q: Free-form search term for fulltext search
* issues: An array of issues
* region: An array of geographical regions
* time: An array of times of day
* day: An array of days of the week
* type: An array of opportunity types
* group_type: An array of volunteer group types

```javascript
const searchParams = {
    q: 'kids and sports',
    issues: ['Children/Youth', 'Education']
};

apiClient.search(searchParams).then((result) => {

    console.log(result.data);
});
```
