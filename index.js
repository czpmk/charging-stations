const express = require('express')
const bodyParser = require('body-parser')
const { body, query, validationResult } = require('express-validator');

const app = express()
const userHandlers = require('./userHandlers');
const stationHandlers = require('./stationsHandlers');
const { response } = require('express');
const cors = require('cors')

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true
    })
)
app.use(cors());

const init = async() => {
    app.put('/register',
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 64, max: 64 }),
        userHandlers.Register);

    app.get('/login',
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 64, max: 64 }),
        userHandlers.Login);

    app.get('/auth',
        query('token').isLength({ min: 32, max: 32 }),
        userHandlers.Authenticate);

    app.get('/stations',
        query('token').isLength({ min: 32, max: 32 }),
        stationHandlers.GetAll);

    app.get('/stations/details',
        query('token').isLength({ min: 32, max: 32 }),
        stationHandlers.GetAll);

    app.get('/stations/by', stationHandlers.GetBy);

    app.listen(3011, () => {
        console.log('Localhost, listening on port 3011')
    })
}

init();