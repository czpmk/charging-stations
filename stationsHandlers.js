const utils = require('./utils')
const { validationResult } = require('express-validator');

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

const GetAllStations = async(request, response) => {
    const { token } = request.query;

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
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
            response.status(200).json({ "valid": true, "length": results.rows.length, "results": [] })
            return;
        }
    })
}

const AddStation = async(request, response) => {
    const { token } = request.query;
    const { longitude, latitude, operator, city, street, housenumber, fee } = request.body;

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    let stationName = "";
    if (operator.length != 0)
        stationName = operator;
    if (city.length != 0) {
        if (stationName.length != 0)
            stationName += " - ";

        stationName += city;

        if (street.length != 0)
            stationName += ". " + street;
    }

    pool.query('INSERT INTO stations (longitude, latitude, name, operator, city, street, housenumber, fee)' +
        ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [longitude, latitude, stationName, operator, city, street, housenumber, fee], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json({ "valid": true })
            return;
        })
}

const UpdateStationInfo = async(request, response) => {
    const { token } = request.query;
    const { id, city, street, housenumber } = request.body;

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    pool.query('UPDATE stations SET city = $1, street = $2, housenumber = $3 WHERE id = $4', [city, street, housenumber, id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json({ "valid": true })
        return;
    })
}

const RemoveStation = async(request, response) => {
    const { token } = request.query;
    const { station_id } = request.body;

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    if (await utils.CheckIfUserIsAdmin(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    pool.query('SELECT * FROM stations WHERE id = $1', [station_id], (error1, results1) => {
        if (error1) {
            throw error1
        }
        if (results1.rows.length != 1) {
            response.status(200).json({ "valid": false, "reason": "station_id", "message": ERROR_MSG.DOES_NOT_EXIST })
            return;
        } else {
            pool.query('DELETE FROM stations WHERE id = $1', [station_id], (error2, results2) => {
                if (error2) {
                    throw error2
                }
            });
            pool.query('DELETE FROM chargers WHERE station_id = $1', [station_id], (error3, results3) => {
                if (error3) {
                    throw error3
                }
            });
            pool.query('DELETE FROM comments WHERE station_id = $1', [station_id], (error4, results4) => {
                if (error4) {
                    throw error4
                }
            });
            pool.query('DELETE FROM ratings WHERE station_id = $1', [station_id], (error5, results5) => {
                if (error5) {
                    throw error5
                }
            });
            response.status(200).json({ "valid": true })
            return;
        }
    })
}

const GetChargers = async(request, response) => {
    const { token } = request.query;

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }


    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
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

const AddCharger = async(request, response) => {
    const { token } = request.query;
    const { station_id, power, plug_type } = request.body;

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }
    // check if station exists
    pool.query('SELECT * FROM stations WHERE id = $1', [station_id], (error1, results1) => {
        if (error1) {
            throw error1
        }
        if (results1.rows.length != 1) {
            response.status(200).json({ "valid": false, "reason": "station_id", "message": ERROR_MSG.DOES_NOT_EXIST })
            return;
        } else {
            // add charger
            pool.query('INSERT INTO chargers (station_id, power, plug_type)' +
                ' VALUES ($1, $2, $3)', [station_id, power, plug_type], (error, results) => {
                    if (error) {
                        throw error
                    }
                    response.status(200).json({ "valid": true })
                    return;
                })
        }
    })
}

const RemoveCharger = async(request, response) => {
    const { token } = request.query;
    const { charger_id } = request.body;

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    if (await utils.CheckIfUserIsAdmin(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    pool.query('SELECT * FROM chargers WHERE id = $1', [charger_id], (error1, results1) => {
        if (error1) {
            throw error1
        }
        if (results1.rows.length != 1) {
            response.status(200).json({ "valid": false, "reason": "charger_id", "message": ERROR_MSG.DOES_NOT_EXIST })
            return;
        } else {
            pool.query('DELETE FROM chargers WHERE id = $1', [charger_id], (error3, results3) => {
                if (error3) {
                    throw error3
                }
            });

            response.status(200).json({ "valid": true })
            return;
        }
    })
}

const GetComments = async(request, response) => {
    const { token } = request.query;

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
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

const RemoveComment = async(request, response) => {
    const { token } = request.query;
    const { comment_id } = request.body;

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    if (await utils.CheckIfUserIsAdmin(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    pool.query('SELECT * FROM comments WHERE id = $1', [comment_id], (error1, results1) => {
        if (error1) {
            throw error1
        }
        if (results1.rows.length != 1) {
            response.status(200).json({ "valid": false, "reason": "comment_id", "message": ERROR_MSG.DOES_NOT_EXIST })
            return;
        } else {
            pool.query('DELETE FROM comments WHERE id = $1', [comment_id], (error3, results3) => {
                if (error3) {
                    throw error3
                }
            });

            response.status(200).json({ "valid": true })
            return;
        }
    })
}

const GetRatings = async(request, response) => {
    const { token } = request.query;

    if (!validationResult(request).isEmpty()) {
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
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
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    const res = await utils.GetUserInfoByToken(pool, token)
    if (!res.valid) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
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
        response.status(200).json({ "valid": false, "reason": "parameters", "message": ERROR_MSG.PARAMETER_INVALID });
        return;
    }

    if (await utils.ValidateToken(pool, token) == false) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return;
    }

    const res = await utils.GetUserInfoByToken(pool, token)
    if (!res.valid) {
        response.status(200).json({ "valid": false, "reason": "token", "message": ERROR_MSG.AUTHENTICATION_INVALID })
        return
    }
    const userId = res.results.user_id

    const alreadyRated = await utils.CheckIfAlreadyRated(pool, userId, station_id)
    if (alreadyRated) {
        response.status(200).json({ "valid": false, "reason": "request", "message": ERROR_MSG.OPERATION_NOT_ALLOWED })
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
    AddRate,
    AddStation,
    AddCharger,
    RemoveStation,
    RemoveCharger,
    RemoveComment,
    UpdateStationInfo
}