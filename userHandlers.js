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

    if (!validationResult(request).isEmpty()) {
        response.status(400).json({ "valid": false, "reason": "password", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    const { email, password } = request.body;

    if (await utils.ExistsInTable(pool, "users", "email", email)) {
        response.status(400).json({ "valid": false, "reason": "email", "message": ERROR_MSG.ALREADY_EXISTS });
        return;
    }

    pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, password], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json({ "valid": true })
    })
}

const Login = async(request, response) => {

    if (!validationResult(request).isEmpty()) {
        response.status(400).json({ "valid": false, "reason": "email_or_password", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    const { email, password } = request.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);

    if (result.rows.length != 1) {
        response.status(400).json({ "valid": false, "reason": "email_or_password", "message": ERROR_MSG.AUTHENTICATION_INVALID });
        return;
    }

    const userID = result.rows[0].id;

    const sessions_results = await pool.query(`DELETE FROM sessions WHERE user_id = ${userID}`);

    const newUUID = utils.GetNewUUID();
    const newTimeStamp = utils.GetTimeStamp(24);

    const new_session_result = await pool.query('INSERT INTO sessions (user_id, expiry_date, token) VALUES ($1, $2, $3)', [userID, newTimeStamp, newUUID])
    response.status(200).json({ "valid": true, "token": newUUID })
    return;
}

const Authenticate = async(request, response) => {
    const { token } = request.query;

    if (await utils.ValidateToken(pool, token)) {
        await utils.UpdateTokenExpiryDate(pool, token)
        response.status(200).json({ "valid": true })
        return;
    } else {
        response.status(400).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID });
        return;
    }
}

module.exports = {
    Register,
    Login,
    Authenticate,
}