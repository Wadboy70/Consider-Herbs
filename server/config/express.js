const path = require('path'),
    express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    dbRouter = require('../routes/dbRouter.js'),
    paymentRouter = require('../routes/paymentRouter.js'),
    cors = require('cors'),
    {auth0} = require('./config'),
    request = require('request');

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

    // cors
    app.use(cors());
    //access codes for authentication
    
    app.get('/auth',(req,res) => {
        res.send(auth0);
    });

    var access;
    var options = {
        method: 'POST',
        url: 'https://wadboy.auth0.com/oauth/token',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        form: {
          grant_type: 'client_credentials',
          client_id: `${auth0.clientId_m}`,
          client_secret: `${auth0.clientSecret_m}`,
          audience: `${auth0.audience}`
        }
      };
      
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        access = body;
      });
     app.get('/auth/access',(req,res)=>{
         res.send(access);
     })
    // add a router
    app.use('/api/db/', dbRouter);
    app.use('/api/payment/', paymentRouter);
    
    app.use(express.static('client/build'));
    app.get('*', (req, res) => res.sendFile(path.resolve('client','build', 'index.html')));

    return app
}

