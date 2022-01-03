// const { response } = require('express')
const utils = require('./utils')
const { body, query, validationResult } = require('express-validator');

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
    PARAMETER_INVALID: "PARAMETER_INVALID",
    AUTHENTICATION_INVALID: "AUTHENTICATION_INVALID",
    AUTHENTICATION_EXPIRED: "AUTHENTICATION_EXPIRED",
    INTERNAL: "INTERNAL"
}

const GetAll = async(request, response) => {
    const { token } = request.query;

    if (!validationResult(request).isEmpty()) {
        response.status(400).json({ "valid": false, "reason": "token", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    pool.query('SELECT * FROM stations', (error, results) => {
        if (error) {
            throw error
        }
        if (results.rows.length != 0) {
            response.status(200).json({ "valid": true, "length": results.rows.length, "results": results.rows })
            return;
        } else {
            response.status(200).json({ "valid": false })
            return;
        }
    })
}

const GetDetails = async(request, response) => {
    const { token } = request.query;

    if (!validationResult(request).isEmpty()) {
        response.status(400).json({ "valid": false, "reason": "token", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    pool.query('SELECT * FROM stations', (error, results) => {
        if (error) {
            throw error
        }
        if (results.rows.length != 0) {
            response.status(200).json({ "valid": true, "length": results.rows.length, "results": results.rows })
            return;
        } else {
            response.status(200).json({ "valid": false })
            return;
        }
    })
}

const GetBy = async(request, response) => {
    const { token, operator } = request.body;
    console.log(name);

    if (!validationResult(request).isEmpty()) {
        response.status(400).json({ "valid": false, "reason": "token", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    let q = 'SELECT * FROM stations WHERE';

    if (operator != null)
        q += ''

    pool.query('SELECT * FROM stations', (error, results) => {
        if (error) {
            throw error
        }
        if (results.rows.length != 0) {
            response.status(200).json({ "valid": true, "length": results.rows.length, "results": results.rows })
        } else {
            response.status(200).json({ "valid": false })
        }
    })
}

module.exports = {
    GetAll,
    GetBy
}