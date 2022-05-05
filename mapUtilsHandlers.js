const utils = require('./utils')
const { validationResult } = require('express-validator');
const fs = require('fs');
const fetch = require('node-fetch');

const pathToGoogleMapsApiKeyJson = './google-api-key';
if (!fs.existsSync(pathToGoogleMapsApiKeyJson)) {
    throw "'google-api-key' file does not exist";
}

let googleMapsApiKeyJson = JSON.parse(fs.readFileSync(pathToGoogleMapsApiKeyJson));
if (!googleMapsApiKeyJson.hasOwnProperty('key')) {
    throw "'key' not found in 'google-api-key' json file";
}
const gmKey = googleMapsApiKeyJson.key;
if (gmKey.length == 0) {
    throw "'key' invalid in 'google-api-key' json file";
}

const PgPool = require('pg').Pool
const pool = new PgPool({
    user: 'postgres',
    host: 'localhost',
    database: 'mapportal',
    password: 'nnmn',
    port: 5432
})

const ERROR_MSG = {
    ALREADY_EXISTS: "ALREADY_EXISTS",
    DOES_NOT_EXIST: "DOES_NOT_EXIST",
    PARAMETER_INVALID: "PARAMETER_INVALID",
    AUTHENTICATION_INVALID: "AUTHENTICATION_INVALID",
    AUTHENTICATION_EXPIRED: "AUTHENTICATION_EXPIRED",
    OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED",
    INTERNAL: "INTERNAL"
}

const ADDRESS = {
    CITY: 'locality',
    STREET: 'route',
    STREET_NUMER: 'street_number'
}

const GoogleMapsAPICall = async (lat, lng, key) => {
    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`);
}

const GoogleMapsAPIResponseProcess = (responseJson) => {
    if (!(responseJson instanceof Object)) {
        return 'Google Maps Api response invalid';
    }
    else if (!Object.hasOwn(responseJson, 'status')) {
        return 'Google Maps Api response does not contain "status" key';
    }
    else if (responseJson['status'] !== 'OK') {
        return 'Google Maps Api response status was: ' + responseJson['status'];
    }
    else if (!Object.hasOwn(responseJson, 'results')) {
        return 'Google Maps Api response does not contain "results" key';
    }
    else if (!(responseJson['results'] instanceof Array)) {
        return 'Google Maps Api response results is not an Array';
    }
    else if (responseJson['results'].length === 0) {
        return 'Google Maps Api response results is an empty Array';
    }

    let bestResult = responseJson['results'][0];
    if (!(bestResult instanceof Object)) {
        return 'Google Maps Api response top [0 idx] result is not an Object';
    }
    else if (!Object.hasOwn(bestResult, 'address_components')) {
        return 'Google Maps Api response top [0 idx] result does not contain a key "address_components"';
    }
    else if (!(bestResult['address_components'] instanceof Array)) {
        return 'Google Maps Api response top [0 idx] result\'s address_components is not an Array';
    }
    else if (bestResult['address_components'].length === 0) {
        return 'Google Maps Api response top [0 idx] result\'s address_components is an empty Array';
    }

    let addressAttributes = bestResult['address_components'];

    let returnJson = new Object();
    returnJson['city'] = null;
    returnJson['street'] = null;
    returnJson['street_number'] = null;

    for (let i in addressAttributes) {
        if (!(addressAttributes[i] instanceof Object))
            continue;

        if (!(Object.hasOwn(addressAttributes[i], 'types')) || !(Object.hasOwn(addressAttributes[i], 'long_name')))
            continue;

        if (addressAttributes[i]['types'].includes(ADDRESS.CITY))
            returnJson['city'] = addressAttributes[i]['long_name'];

        else if (addressAttributes[i]['types'].includes(ADDRESS.STREET))
            returnJson['street'] = addressAttributes[i]['long_name'];

        else if (addressAttributes[i]['types'].includes(ADDRESS.STREET_NUMER))
            returnJson['street_number'] = addressAttributes[i]['long_name'];

    }

    return returnJson;
}

const ReverseGeocode = async (request, response) => {
    const { token } = request.query;
    const { longitude, latitude } = request.body;

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    const gApiResponse = await GoogleMapsAPICall(latitude, longitude, gmKey);
    const responseJson = await gApiResponse.json();

    const result = GoogleMapsAPIResponseProcess(responseJson);
    if (!(result instanceof Object)) {
        console.log(result);
        response.status(200).json({ "valid": false, "reason": result, "message": ERROR_MSG.INTERNAL })
        return;
    }

    response.status(200).json({ "valid": true, "length": Object.keys(result).length, "results": result })
    return;
}



module.exports = {
    ReverseGeocode,
}