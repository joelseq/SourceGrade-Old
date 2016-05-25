/*Required variables*/
const express    = require("express"),
      mongoose   = require("mongoose"),
      bodyParser = require("body-parser"), //To get post information
      User       = require("./models/user"),
      methodOverride = require("method-override"),
      config     = require("./config"),
      passport   = require("passport"),
      LocalStrategy = require("passport-local");

const app = express();

mongoose.connect(config.mongoDBURL);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(require('express-session')({
  secret: config.secret,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Middleware to automatically add req.user to every route
//MUST COME AFTER "app.use(passport.session())"
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
});

//Routes
require("./routes")(app);

module.exports = app;
