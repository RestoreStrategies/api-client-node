'use strict';

const Joi = require('joi');


const itemSchema = Joi.object().keys({
    href: Joi.string().required(),
    data: Joi.array(),
    links: Joi.array()
});

const collectionSchema = Joi.object().keys({
    collection: Joi.object().keys({
        href: Joi.string().required(),
        version: Joi.string().required(),
        links: Joi.array(),
        items: Joi.array().items(itemSchema),
        queries: Joi.array(),
        template: Joi.object().keys({
            data: Joi.array()
        }),
        error: Joi.object().keys({
            title: Joi.string(),
            code: Joi.string(),
            message: Joi.string()
        })
    }).required()
});


/**
* Get the value, array or object from an element of a data array
*
* @param {hash} dataElement     An element of a data array
*
* @returns {} value             A number, string, boolean, array, or object if
* one exists. Else returns null.
*/
const _getValue = function (dataElement) {

    if (typeof dataElement.value !== 'undefined') {
        return dataElement.value;
    }
    else if (typeof dataElement.array !== 'undefined') {
        return dataElement.array;
    }
    else if (typeof dataElement.object !== 'undefined') {
        return dataElement.object;
    }

    return null;
};


/**
* Validate a collection+JSON object
*
* @param {object} collection    A JSON object to validate as collection+JSON
*
* @returns {promise} promise    A promise that resolves with the collection if
* it is valid or reject with relevant error messages if it is invalid
*/
const validateCollection = function (collection) {

    const promise = new Promise((resolve, reject) => {

        Joi.validate(collection, collectionSchema, (err, value) => {

            if (err) {
                reject(err);
            }
            resolve(value);
        });
    });

    return promise;
};


/**
* Turn a Collection+JSON item into an easier to use object
*
* @param {hash} item            A valid Collection+JSON item
*
* @returns {object} object    A JSON object that is a version of the
* Collection+JSON item. The names in the data array become keys & the values
* become the values of those keys.
*/
const objectifyItem = function (item) {

    const object = {
        href: item.href
    };

    if (typeof item.links !== 'undefined') {
        object.links = item.links;
    }

    if (typeof item.data === 'undefined') {
        return object;
    }

    for (let i = 0; i < item.data.length; ++i) {
        object[item.data[i].name] = _getValue(item.data[i]);
    }

    return object;
};


/**
* Turn a Collection+JSON collection into an easier to use array of objects
*
* @param {object} collection            A valid Collection+JSON collection
*
* @returns {array} itemsObjectified     An array of items that have been
* transformed via objectifyItem
*/
const objectifyCollection = function (collection) {

    const itemsObjectified = [];

    for (let i = 0; i < collection.collection.items.length; ++i) {
        itemsObjectified.push(objectifyItem(collection.collection.items[i]));
    }

    return itemsObjectified;
};

module.exports.objectifyCollection = objectifyCollection;
module.exports.validateCollection = validateCollection;
