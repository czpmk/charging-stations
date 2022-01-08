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
        stationHandlers.GetAllStations);

    app.get('/chargers',
        query('token').isLength({ min: 32, max: 32 }),
        stationHandlers.GetChargers);

    app.get('/comments',
        query('token').isLength({ min: 32, max: 32 }),
        stationHandlers.GetComments);

    app.get('/comments',
        query('token').isLength({ min: 32, max: 32 }),
        body('station_id').isNumeric(),
        stationHandlers.GetComments);

    app.post('/comments/new',
        query('token').isLength({ min: 32, max: 32 }),
        body('comment').isLength({ min: 1, max: 500 }),
        body('station_id').isNumeric(),
        stationHandlers.AddComment);

    app.get('/ratings',
        query('token').isLength({ min: 32, max: 32 }),
        stationHandlers.GetRatings);

    app.listen(3011, () => {
        console.log('Localhost, listening on port 3011')
    })
}

init();