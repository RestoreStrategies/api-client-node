# Restore Strategies API client

This is a Node.js client for the Restore Strategies's API. The API allows clients to view, filter, search & sign up for volunteer opportunities.

## Initializing

To use the API you need valid credentials. An instance of the API client requires a user token & secret.

```javascript
const Client = require('restore-strategies-client');

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
* issues: An array of issues. Acceptable values: 'Children/Youth', 'Elderly', 'Family/Community', 'Foster Care/Adoption', 'Healthcare', 'Homelessness', 'Housing', 'Human Trafficking', 'International/Refugee', 'Job Training', 'Sanctity of Life', 'Sports', and 'Incarceration'
* regions: An array of geographical regions. Acceptable values: 'North', 'Central', 'East', 'West', and 'Other'
* municipalities: An array of municipalities (i.e. suburbs, neighborhoods, etc). Acceptable values vary by metropolitan area.
* times: An array of times of day. Acceptable values: 'Morning', 'Mid-Day', 'Afternoon', 'Evening'
* days: An array of days of the week. Acceptable values: 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', and 'Sunday'
* type: An array of opportunity types. Acceptable values: 'Gift', 'Service', 'Specific Gift', 'Training'
* group_types: An array of volunteer group types. Acceptable values: 'Individual', 'Group', 'Family'


```javascript
const searchParams = {
    q: 'kids and sports',
    issues: ['Children/Youth', 'Education']
};

apiClient.search(searchParams).then((result) => {

    console.log(result.data);
});
```

## Signup

The client can submit signups for opportunities.

The signup data is in the form of a Collection+JSON template.

```javascript
const templateData = {
    template: {
        data: [
            { name: 'givenName', value: 'Jon' },
            { name: 'familyName', value: 'Doe' },
            { name: 'telephone', value: '5124567890' },
            { name: 'email', value: 'jon.doe@example.com' },
            { name: 'comment', value: '' },
            { name: 'numOfItemsCommitted', value: 1 },
            { name: 'lead', value: 'other' }
        ]
    }
};

apiClient.signup.submit(1, templateData).then((result) => {

    if (result.response.statusCode === 202) {
        console.log('The signup was accepted!');
    }
});
```
