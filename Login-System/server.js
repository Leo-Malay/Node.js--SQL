/*
    This is the server file for the Simple Login System.
    Version: 1.0.0
    Author: Malay Bhavsar
*/

// Importing the libraries.
var express = require("express");
var bodyParser = require("body-parser");
var db = require("./db");
var router = require("./router");

// Declaring the variables.
const PORT = 8800;

// Making object.
var app = express();

// Body parser JSON.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Using external apps for routing purpose.
app.use(router);

// Starting the server.
db.connect((err) => {
    if (err) {
        console.log("[ERR] :-> Failed connecting to database!");
        process.exit(1);
    } else {
        app.listen(PORT, () => {
            console.log("Server started! PORT:" + PORT);
        });
    }
});
