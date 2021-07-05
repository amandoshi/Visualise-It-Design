// import dependencies
const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const session = require("express-session");

// initalise express app
const app = express();

// register view engine
app.set("view engine", "ejs");

// initalise directory for static files
app.use(express.static(path.join(__dirname, "public")));

// parse HTML form
app.use(express.urlencoded({ extended: true }));

// prase JSON bodies (as sent by API clients)
app.use(express.json());

// initialise favicon
app.use(favicon(path.join(__dirname, "public", "images", "favicon.png")));

// initialise express-sessions
app.use(
	session({
		secret: "secret-key",
		resave: false,
		saveUninitialized: false,
	})
);

// define routes
app.use("/input", require("./routes/input"));
app.use("/visualise", require("./routes/visualise"));
app.use("/traverse", require("./routes/traverse"));

// 404 route
// TODO

// listen for requests
app.listen(3000, () => {
	console.log("Listening on port 3000, http://localhost:3000");
});
