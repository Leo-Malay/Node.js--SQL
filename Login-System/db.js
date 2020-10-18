/*
    This is the DB file for the Simple Login System.
    Version: 1.0.0
    Author: Malay Bhavsar
*/

// Importing the libraries.
var mysql = require("mysql");

const state = {
    db: null,
};
const connect = (cb) => {
    if (state.db) cb();
    else {
        var con_db = mysql.createConnection({
            host: "localhost",
            user: "",
            password: "",
            database: "login_system",
        });
        con_db.connect((err) => {
            if (err) cb(err);
            else {
                state.db = con_db;
                cb();
            }
        });
    }
};
// Making useful functions.

const getdb = () => {
    return state.db;
};

module.exports = { getdb, connect };
