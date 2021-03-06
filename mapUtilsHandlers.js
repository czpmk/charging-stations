const utils = require('./utils')
const { validationResult } = require('express-validator');
const { ApiKeyManager } = require("@esri/arcgis-rest-request");
const { solveRoute } = require("@esri/arcgis-rest-routing");
const fs = require('fs');
const fetch = require('node-fetch');

const pathToApiKeysJson = './api-keys';
if (!fs.existsSync(pathToApiKeysJson)) {
    throw "'api-keys' file does not exist";
}

let apiKeysJson = JSON.parse(fs.readFileSync(pathToApiKeysJson));
if (!apiKeysJson.hasOwnProperty('googleKey')) {
    throw "'googleKey' not found in 'api-keys' json file";
}
const gmKey = apiKeysJson.googleKey;
if (gmKey.length == 0) {
    throw "'googleKey' invalid in 'api-keys' json file";
}

if (!apiKeysJson.hasOwnProperty('arcGisKey')) {
    throw "'arcGisKey' not found in 'api-keys' json file";
}
const arcGisKey = apiKeysJson.arcGisKey;
if (arcGisKey.length == 0) {
    throw "'arcGisKey' invalid in 'api-keys' json file";
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

const ArcGisCall = async (start, end) => {
    return await solveRoute(
        {
            stops: [start, end],
            authentication: ApiKeyManager.fromKey(arcGisKey)
        }
    )
}

const GetRoute = async (request, response) => {
    const { token } = request.query;
    const { longitude1, latitude1, longitude2, latitude2 } = request.body;

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID });
        return;
    }

    try {
        let arcGisCallResponse = await ArcGisCall([longitude1, latitude1], [longitude2, latitude2]);
        response.status(200).json({ "valid": true, "length": Object.keys(arcGisCallResponse).length, "results": arcGisCallResponse });
    }
    catch (exc) {
        console.log(exc);
        response.status(200).json({ "valid": false, "reason": null, "message": ERROR_MSG.INTERNAL });
    }
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
    GetRoute
}