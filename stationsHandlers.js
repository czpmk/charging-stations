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
    OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED",
    INTERNAL: "INTERNAL"
}

const GetAllStations = async(request, response) => {
    const { token } = request.query;

    if (!validationResult(request).isEmpty()) {
        response.status(400).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(400).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
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
            response.status(200).json({ "valid": true, "length": results.rows.length, "results": [] })
            return;
        }
    })
}

const GetChargers = async(request, response) => {
    const { token } = request.query;

    if (!validationResult(request).isEmpty()) {
        response.status(400).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }


    if (await utils.ValidateToken(pool, token) == false) {
        response.status(400).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    pool.query('SELECT * FROM chargers', (error, results) => {
        if (error) {
            throw error
        }
        if (results.rows.length != 0) {
            response.status(200).json({ "valid": true, "length": results.rows.length, "results": results.rows })
            return;
        } else {
            response.status(200).json({ "valid": true, "length": results.rows.length, "results": [] })
            return;
        }
    })
}

const GetComments = async(request, response) => {
    const { token } = request.query;

    if (!validationResult(request).isEmpty()) {
        response.status(400).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(400).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    pool.query('SELECT comments.id, comments.station_id, comments.user_id, comments.comment, users.email FROM comments RIGHT JOIN users ON comments.user_id = users.id', (error, results) => {
        if (error) {
            throw error
        }
        if (results.rows.length != 0) {
            response.status(200).json({ "valid": true, "length": results.rows.length, "results": results.rows })
            return;
        } else {
            response.status(200).json({ "valid": true, "length": results.rows.length, "results": [] })
            return;
        }
    })
}

const GetRatings = async(request, response) => {
    const { token } = request.query;

    if (!validationResult(request).isEmpty()) {
        response.status(400).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(400).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    pool.query('SELECT * FROM ratings', (error, results) => {
        if (error) {
            throw error
        }
        if (results.rows.length != 0) {
            response.status(200).json({ "valid": true, "length": results.rows.length, "results": results.rows })
            return;
        } else {
            response.status(200).json({ "valid": true, "length": results.rows.length, "results": [] })
            return;
        }
    })
}

const AddComment = async(request, response) => {
    const { token } = request.query;
    const { comment, station_id } = request.body;

    if (!validationResult(request).isEmpty()) {
        response.status(400).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(400).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    const res = await utils.GetUserInfoByToken(pool, token)
    if (!res.valid) {
        response.status(400).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return
    }
    const userId = res.results.user_id

    pool.query('INSERT INTO comments (user_id, station_id, comment) VALUES ($1, $2, $3)', [userId, station_id, comment], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json({ "valid": true })
        return;
    })
}

const AddRate = async(request, response) => {
    const { token } = request.query;
    const { rate, station_id } = request.body;

    if (!validationResult(request).isEmpty()) {
        response.status(400).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(400).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    const res = await utils.GetUserInfoByToken(pool, token)
    if (!res.valid) {
        response.status(400).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return
    }
    const userId = res.results.user_id

    const alreadyRated = await utils.CheckIfAlreadyRated(pool, userId, station_id)
    if (alreadyRated) {
        response.status(400).json({ "valid": false, "reason": "request", "message": ERROR_MSG.OPERATION_NOT_ALLOWED })
        return;
    } else {
        pool.query('INSERT INTO ratings (user_id, station_id, rate) VALUES ($1, $2, $3)', [userId, station_id, rate], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json({ "valid": true })
            return;
        })
    }
}

module.exports = {
    GetAllStations,
    GetChargers,
    GetComments,
    GetRatings,
    AddComment,
    AddRate
}