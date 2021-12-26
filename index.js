const express = require('express')
const bodyParser = require('body-parser')
const req = require('express/lib/request')
const app = express()

const PgPool = require('pg').Pool
const pool = new PgPool({
    user: 'postgres',
    host: 'localhost',
    database: 'mapportal',
    password: 'nnmn',
    port: 5432
})
const { response } = require('express')

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true
    })
)

// setx DATABASE_URL "postgres://postgres:nnmn@localhost:5432/mapportal"

const aHandler = async(request, response) => {
    pool.query('SELECT * FROM stations', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const init = async() => {
    app.get('/', aHandler)

    app.listen(3011, () => {
        console.log('Running on port 3011')
    })
}

init();