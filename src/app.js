const express = require('express');
const config = require('config');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();

const {port, version} = config.get('api');

function logErrors(err, req, res, next) { next(err) }

function clientErrorHandler(err, req, res, next) { req.xhr ? res.status(500).send({ error: 'Something went wrong.' }) : next(err) }

app.use(helmet());
app.use(cors());
app.use(bodyParser.json({limit: '1024MB', extended: true}));
app.use(bodyParser.urlencoded({limit: "1024MB", extended: true}));

app.use(logErrors);
app.use(clientErrorHandler);

require('./routes')(app, version);

// Endpoint cơ bản
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;