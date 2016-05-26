const express   = require('express'),
      passport  = require('passport'),
      User      = require('../models/user'),
      sanitizer = require('express-sanitizer'),
      router    = express.Router();

router.get("/login", function(req,res) {
  res.render("login");
});

router.post("/login", passport.authenticate("local",
  {
    successRedirect: "/home",
    failureRedirect: "/login"
  }), function(req,res) {

});

router.get("/signup", function(req,res) {
  res.render("register");
});

router.post("/signup", function(req,res) {
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user) {
    if(err) {
      console.log(err);
      return res.redirect("/signup");
    }
    passport.authenticate("local")(req,res, function(){
      res.redirect("/home");
    });
  });
});

router.get("/logout", function(req,res) {
  req.logout();
  res.redirect("/");
});

module.exports = router;
