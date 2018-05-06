var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var routes = require("./routes/routes.js");
var mongoose = require('mongoose');

var app = express();
var port = process.env.PORT || 3000;
mongoose.connect('mongodb://pradeep:votingapp@ds115740.mlab.com:15740/votingapp');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));



routes(app);

var server = app.listen(port, function () {
    console.log("app running on port :", server.address().port);
});



