/*
    This is the router file for all request.
    Version: 1.0.0
    Author: Malay Bhavsar
*/

// Importing all the libraries.
var express = require("express");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var db = require("./db");

// Making object.
var router = express.Router();

// Defining the variables.
const token_key = "SimpleKey";

// All the request are as follow.
router.post("/new_user", (req, res) => {
    // Storing the recieved values to a variable.
    var detail_Name = req.body.name;
    var detail_Username = req.body.username;
    var detail_Password = req.body.password;
    var detail_Mobile = req.body.mobile;
    var detail_City = req.body.city;
    var detail_State = req.body.state;
    var detail_Country = req.body.country;
    // Creating the query & hashing the password.
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(detail_Password, salt, (err, hash) => {
            if (err) throw err;
            var table_detail =
                "INSERT INTO user_detail VALUES ('" +
                detail_Name +
                "','" +
                detail_Username +
                "','" +
                detail_Mobile +
                "','" +
                detail_City +
                "','" +
                detail_State +
                "','" +
                detail_Country +
                "');";
            var table_credential =
                "INSERT INTO user_credential VALUES ('" +
                detail_Name +
                "','" +
                detail_Username +
                "','" +
                hash +
                "');";
            var table_login =
                "INSERT INTO login_detail VALUES ('" +
                detail_Username +
                "','" +
                null +
                "','" +
                null +
                "');";
            // Starting the db operation.
            db.getdb().query(
                "SELECT COUNT(username) FROM user_detail WHERE username='" +
                    detail_Username +
                    "';",
                (err, result) => {
                    if (err) throw err;
                    let results = JSON.parse(JSON.stringify(result));
                    if (results[0]["COUNT(username)"] == 0) {
                        db.getdb().query(table_detail, (err, result) => {
                            if (err) throw err;
                        });
                        db.getdb().query(table_login, (err, result) => {
                            if (err) throw err;
                        });
                        db.getdb().query(table_credential, (err, result) => {
                            if (err) throw err;
                        });
                        // Sending the ok responce.
                        res.json({
                            status: 200,
                            success: "True",
                            msg: "User-profile created successfully!",
                        });
                        console.log("[log]: New user created");
                    } else {
                        // Sending the ok responce.
                        res.json({
                            status: 200,
                            success: "False",
                            msg: "Username Already exist try another one!",
                        });
                        console.log("[log]: NNew user creation failed");
                    }
                }
            );
        });
    });
});
router.post("/remove_user", verifyToken, (req, res) => {
    // Storing the recieved values to a variable.
    var detail_Username = req.body.username;
    // Checking if the token is tampered with?
    jwt.verify(req.token, token_key, async (err, decode) => {
        if (err) throw err;
        if (decode.username == detail_Username) {
            // Creating the query & hashing the password.
            var table_detail =
                "DELETE FROM user_detail WHERE username='" +
                detail_Username +
                "'";
            var table_credential =
                "DELETE FROM user_credential WHERE username='" +
                detail_Username +
                "'";
            var table_login_detail =
                "DELETE FROM login_detail WHERE username='" +
                detail_Username +
                "'";
            // Starting the db operation.
            db.getdb().query(
                "SELECT COUNT(username) FROM user_detail WHERE username='" +
                    detail_Username +
                    "';",
                (err, result) => {
                    if (err) throw err;
                    let results = JSON.parse(JSON.stringify(result));
                    if (results[0]["COUNT(username)"] == 1) {
                        db.getdb().query(table_detail, (err, result) => {
                            if (err) throw err;
                        });
                        db.getdb().query(table_credential, (err, result) => {
                            if (err) throw err;
                        });
                        db.getdb().query(table_login_detail, (err, result) => {
                            if (err) throw err;
                            // Sending the ok responce.
                            res.json({
                                status: 200,
                                success: "True",
                                msg: "User-profile deleted successfully!",
                            });
                            console.log("[log]: User profile deleted");
                        });
                    } else if (results[0]["COUNT(username)"] == 0) {
                        // Sending the ok responce.
                        res.json({
                            status: 200,
                            success: "False",
                            msg: "No such user exists.",
                        });
                        console.log("[log]: User deletion failed");
                    }
                }
            );
        } else {
            res.json({
                status: 200,
                success: "False",
                msg: "You are not authorized to delete the account!",
            });
        }
    });
});
router.post("/login", (req, res) => {
    // Storing the recieved value to the variable.
    var detail_Username = req.body.username;
    var detail_Password = req.body.password;
    // Creating the query & checking password.
    var pass_query =
        "SELECT password FROM user_credential WHERE username='" +
        detail_Username +
        "';";
    db.getdb().query(pass_query, async (err, result) => {
        if (err) throw err;
        let results = JSON.parse(JSON.stringify(result));
        if (results.length == 0) {
            res.json({
                status: 200,
                success: "False",
                token: "None",
                msg: "Falied to login! Invalid credential",
            });
        } else {
            if (results[0]["password"] != null) {
                bcrypt.compare(
                    detail_Password,
                    results[0]["password"],
                    function (err, result) {
                        if (err) {
                            res.json({
                                status: 500,
                                success: "False",
                                token: "None",
                                msg: "Server error occured",
                            });
                        } else {
                            if (result == false) {
                                res.json({
                                    status: 200,
                                    success: "False",
                                    token: "None",
                                    msg: "Falied to login! Invalid credential",
                                });
                            } else if (result == true) {
                                // Making a date and time stamp;
                                var date_stamp = date_stamp_f();
                                var time_stamp = time_stamp_f();
                                var token_gen_query = {
                                    username: detail_Username,
                                    date_login: date_stamp,
                                    time_login: time_stamp,
                                };
                                const token = jwt.sign(
                                    token_gen_query,
                                    token_key,
                                    {
                                        expiresIn: "30d",
                                    }
                                );
                                db.getdb().query(
                                    "UPDATE login_detail SET current_token='" +
                                        token +
                                        "' WHERE username='" +
                                        detail_Username +
                                        "';",
                                    async (err, result) => {
                                        if (err) throw err;
                                        res.json({
                                            status: 200,
                                            success: "True",
                                            token: token,
                                            msg: "Login successfull!",
                                        });
                                    }
                                );
                                // moving the current_token to the previous token ih the database.
                                db.getdb().query(
                                    "UPDATE login_detail SET prev_token=current_token WHERE username='" +
                                        detail_Username +
                                        "';",
                                    async (err, result) => {
                                        if (err) throw err;
                                    }
                                );
                            }
                        }
                    }
                );
            }
        }
    });
});
router.post("/logout", verifyToken, (req, res) => {
    // Storing the recieved values to a variable.
    var detail_Username = req.body.username;
    // Checking if the token is tampered with?
    jwt.verify(req.token, token_key, async (err, decode) => {
        if (err) throw err;
        if (decode.username == detail_Username) {
            // Moving the current_token to the previous token ih the database.
            db.getdb().query(
                "UPDATE login_detail SET prev_token=current_token WHERE username='" +
                    detail_Username +
                    "';",
                async (err, result) => {
                    if (err) throw err;
                }
            );
            // Emptying the current token.
            db.getdb().query(
                "UPDATE login_detail SET current_token='null' WHERE username='" +
                    detail_Username +
                    "';",
                async (err, result) => {
                    if (err) throw err;
                    res.json({
                        status: 200,
                        success: "True",
                        msg: "Logout Success!",
                    });
                }
            );
        } else {
            res.json({
                status: 200,
                success: "False",
                msg: "Your token is tampered!",
            });
        }
    });
});

// Supporting functions for convience.
function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
        // Getting the token.
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;

        token_query =
            "SELECT current_token,prev_token FROM login_detail WHERE username='" +
            req.body.username +
            "';";
        db.getdb().query(token_query, (err, result) => {
            if (err) throw err;
            let results = JSON.parse(JSON.stringify(result));
            if (results[0]["current_token"] == req.token) {
                next();
            } else if (results[0]["prev_token"] == req.token) {
                res.json({
                    status: 200,
                    success: "False",
                    msg: "Your token has expired.Please login to continue!",
                });
            }
        });
    } else {
        res.status(403);
        res.json({
            status: 403,
            success: "false",
            msg: "Please Login to Continue!",
        });
    }
}
function date_stamp_f() {
    // Getting the current date and time required for genreation of token.
    var _date_time = new Date();
    // Fetching and displaying current date...
    var day = _date_time.getDate();
    var month = _date_time.getMonth();
    var year = _date_time.getFullYear();
    return year + "/" + month + "/" + day;
}
function time_stamp_f() {
    // Getting the current date and time required for genreation of token.
    var _date_time = new Date();
    // Fetching and displaying current time...
    var hour = _date_time.getHours();
    var minute = _date_time.getMinutes();
    var second = _date_time.getSeconds();
    return hour + ":" + minute + ":" + second;
}
// Exporting the object to be used in server.
module.exports = router;
