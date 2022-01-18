// const { response } = require('express')
const utils = require('./utils')
const { body, validationResult } = require('express-validator');

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

const Register = async(request, response) => {
    const { email, password } = request.body;

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "password", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ExistsInTable(pool, "users", "email", email)) {
        response.status(200).json({ "valid": false, "reason": "email", "message": ERROR_MSG.ALREADY_EXISTS });
        return;
    }

    pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, password], (error, results) => {
        if (error) {
            throw error
        }
    })

    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);

    if (result.rows.length != 1) {
        response.status(200).json({ "valid": false, "reason": "email_or_password", "message": ERROR_MSG.AUTHENTICATION_INVALID });
        return;
    }

    const userID = result.rows[0].id;

    const session_results = await utils.CreateSession(pool, userID)
    response.status(200).json(session_results)
    return;
}

const LogIn = async(request, response) => {

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "email_or_password", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    const { email, password } = request.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);

    if (result.rows.length != 1) {
        response.status(200).json({ "valid": false, "reason": "email_or_password", "message": ERROR_MSG.AUTHENTICATION_INVALID });
        return;
    }

    const userID = result.rows[0].id;

    const session_results = await utils.CreateSession(pool, userID)
    response.status(200).json(session_results)
    return;
}


const LogOut = async(request, response) => {
    const { token } = request.query;

    if (await utils.ValidateToken(pool, token)) {
        await utils.RemoveToken(pool, token)
        response.status(200).json({ "valid": true })
        return;
    } else {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID });
        return;
    }
}


const Authenticate = async(request, response) => {
    const { token } = request.query;

    if (await utils.ValidateToken(pool, token)) {
        await utils.UpdateTokenExpiryDate(pool, token)
        response.status(200).json({ "valid": true })
        return;
    } else {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID });
        return;
    }
}

const GetUserInfo = async(request, response) => {
    const { token } = request.query;
    let isAdmin = false;
    let email = "";

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    } else if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    isAdmin = (await utils.CheckIfUserIsAdmin(pool, token))
    userData = (await utils.GetUserInfoByToken(pool, token))

    if (userData == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    } else {
        response.status(200).json({ "valid": true, "results": { "is_admin": isAdmin, "email": userData.results.email, "user_id": userData.results.user_id } })
        return;
    }
}

module.exports = {
    Register,
    LogIn,
    LogOut,
    Authenticate,
    GetUserInfo
}