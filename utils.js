const { v4: uuidv4 } = require('uuid');
const PgPool = require('pg').Pool
const pool = new PgPool({
    user: 'postgres',
    host: 'localhost',
    database: 'mapportal',
    password: 'nnmn',
    port: 5432
})


const ExistsInTable = async(pool, tableName, colName, value) => {
    const res = await pool.query(`SELECT * FROM ${tableName} WHERE ${colName} = $1`, [value]);
    return res.rows.length != 0;
}

const GetNewUUID = () => {
    return uuidv4().split('-').join('')
}

const GetTimeStamp = (addHours = false) => {
    let d = new Date();
    if (addHours != false)
        d.setHours(d.getHours() + addHours);

    return d.toISOString().slice(0, 19).replace('T', ' ');
}

const ValidateToken = async(pool, token) => {
    const result = await pool.query('SELECT * FROM sessions WHERE token = $1', [token]);

    if (result.rows.length == 0) {
        return false;
    } else if (result.rows.length > 1) {
        const sessions_results = await pool.query(`DELETE FROM sessions WHERE token = $1`, [token]);
        return false;
    }

    if (result.rows[0].expiry_date < new Date()) {
        const sessions_results = await pool.query(`DELETE FROM sessions WHERE token = $1`, [token]);
    } else {
        return true;
    }
}


const GetUserInfoByToken = async(pool, token) => {
    const result = await pool.query('SELECT sessions.user_id, users.email FROM sessions RIGHT JOIN users ON sessions.user_id = users.id WHERE sessions.token = $1', [token]);
    if (result.rows.length != 1) {
        return { "valid": false };
    } else return { "valid": true, "results": result.rows[0] }
}

const UpdateTokenExpiryDate = async(pool, token) => {
    let expDate = GetTimeStamp(24);
    const new_session_result = await pool.query('UPDATE sessions SET expiry_date = $1 WHERE token = $2', [expDate, token])
    return true;
}


module.exports = {
    ExistsInTable,
    GetTimeStamp,
    GetNewUUID,
    ValidateToken,
    UpdateTokenExpiryDate,
    GetUserInfoByToken
}