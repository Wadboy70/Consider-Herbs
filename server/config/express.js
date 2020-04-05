const path = require('path'),
    express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    dbRouter = require('../routes/dbRouter.js');

module.exports.init = () => {
    /* 
        connect to database
        - reference README for db uri
    */

    // initialize app
    const app = express();

    // enable request logging for development debugging
    app.use(morgan('dev'));

    app.use(bodyParser.urlencoded({
        extended: true
      }));

    // body parsing middleware
    app.use(bodyParser.json());

    // add a router
    app.use('/api/db/', dbRouter);

    if (process.env.NODE_ENV === 'production') {
        // Serve any static files
        app.use(express.static(path.join(__dirname, '../../client/build')));

        // Handle React routing, return all requests to React app
        app.get('*', function(req, res) {
            res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
        });
    }

    return app
}

