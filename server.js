/*
CSC3916 HW3
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
const { mongo } = require('mongoose');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {

    console.log("Signup request recieved.");

    if (!req.body.username || !req.body.password) {
        console.log("Missing either username or password.");
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000) {
                    console.log("User with username already exists.");
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                } else {
                    console.log("Failed to create user.");
                    return res.json(err);
                }
            }
            console.log("User created.");
            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {

    console.log("Signin request received.");
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            console.log("Failed to sign user in.");
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                console.log("User logged in.");
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                console.log("Username or password incorrect.");
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

/******************************************************** */
/*  MOVIES                                                */
/******************************************************** */
router.route('/movies')
    .get(authJwtController.isAuthenticated,(req, res) => {
        // Implementation here
        console.log("GET request received.");
        Movie.find(req.query, function(err,movie){
            res.json(movie);
        });

    })
    .post(authJwtController.isAuthenticated,(req, res) => {
        // Save movie
        console.log("POST request received.");
        if (!req.body.title) {
            console.log("Process failed: Missing movie title")
            res.json({success: false, msg: 'Please include movie title to save movie.'})
        } else {
            var movie = new Movie();
            movie.title = req.body.title;
            movie.releaseDate = req.body.releaseDate;
            movie.genre = req.body.genre;
            movie.actors = req.body.actors;
    
            movie.save(function(err){
                if (err) {
                    console.log("Failed to save movie");
                    return res.json(err);
                }
                console.log("Saved movie.");
                res.json({success: true, msg: 'Successfully created new movie.'})
            });
        }
    })
    .put(authJwtController.isAuthenticated,(req,res) => {
        //update specific movie based on query, fail without query
        console.log("PUT request recieved.");
        if(!req.query._id)
        {
            console.log("PUT failed: Missing movie specification.");
            res.json({success: false, msg: "Please specify a movie to update."});
        } else {
            var movie = {
                title : req.body.title,
                releaseDate : req.body.releaseDate,
                genre : req.body.genre,
                actors : req.body.actors,
            };
            Movie.updateOne(req.query, movie, function(err){
                if (err) {
                    console.log("Failed to update movie.");
                    return res.json(err);
                }
                console.log("Updated movie.");
                res.json({success: true, msg: 'Successfully updated movie.'})
            });
        }
    })
    .delete(authJwtController.isAuthenticated,(req,res) => {
        //delete movie based on query, fail without query
        console.log("DELETE request recieved.");
        if(!req.query._id)
        {
            console.log("DELETE failed: Missing movie specification.");
            res.json({success: false, msg: "Please specify a movie to delete."});
        } else {
            Movie.deleteOne(req.query, function(err){
                if (err) {
                    console.log("Failed to delete movie.");
                    return res.json(err);
                }
                console.log("Movie deleted.");
                res.json({success: true, msg: 'Successfully deleted movie.'})
            });
        }
    })
    .all((req, res) => {
        // Any other HTTP Method
        // Returns a message stating that the HTTP method is unsupported.
        res.status(405).send({ message: 'HTTP method not supported.' });
    });

/******************************************************** */


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


