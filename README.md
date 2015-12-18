# For the City API client

This is a Node.js cliet for the For the City Network's API. The API allows clients to view, filter, search & sign up for volunteer opportunities.

## Initializing

To use the API you need valid credentials. An instance of the API client requires a user token & secret.

```javascript
const Client = require('forthecity-client');

const apiClient = new Client({ token: <a_user_token>, secret: <a_user_secet>});
```

## Viewing Opportunities

It is possible to view opportunities individually or all at once. The response hash has 3 keys:

* response: the full [Request](https://www.npmjs.com/package/request) response object
* data: the HTTP body
* error: a [Request](https://www.npmjs.com/package/request) error, this is usually null

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
