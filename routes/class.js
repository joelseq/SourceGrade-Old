const express   = require('express'),
      router    = express.Router(),
      sanitizer = require('express-sanitizer'),
      Class     = require('../models/class');

router.post("/class", function(req,res) {
  req.body.newClass.user = req.user._id;

  Class.create(req.body.newClass, function(err, created) {
    if(err) {
      console.log(err);
      return res.render("/");
    }
    res.redirect("/home");
  });
});

router.get("/class/new", function(req,res) {
  res.render("add-class");
});

router.get("/class/:id/edit", function(req,res) {
  Class.findById(req.params.id, function(err, foundClass) {
    if(err) {
      console.log(err);
      return res.redirect("/");
    }
    res.render("edit-class", {found: foundClass});
  });
});

router.put("/class/:id", function(req,res) {
  var newClass = {
    name: req.body.name,
    courseId: req.body.id,
    courseUrl: req.body.url,
    user: req.user._id
  };
  Class.findById(req.params.id, newClass, function(err, updatedClass) {
    if(err) {
      res.redirect("/");
    } else {
      res.redirect("/home");
    }
  });
});


router.delete("/class/:id", function(req,res) {
  Class.findByIdAndRemove(req.params.id, function(err) {
    if(err) {
      res.redirect("/");
    } else {
      res.redirect("/home");
    }
  });
});


module.exports = router;
