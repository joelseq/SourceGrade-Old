var express = require("express");
var cheerio = require("cheerio");
var request = require("request");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get("/", function(req,res) {
   res.render("home");
});


app.post("/scrape", function(req, res) {
   var id = req.body.sourceid;
   url = req.body.sourceurl;

   request(url, function(error, response, html){
      if(error) {
          console.log(error);
      } else {
          var $ = cheerio.load(html);

          var grade;

          $('table').attr('cellpadding', '3').filter(function(){
             var table = $(this);
             var row = table.children().first();
             for(var i = 0; i < table.children().length; i++){
                 if(row.children().first().text() === id) {
                    grade = row.children().last().text();
                 } else {
                     if(row.next() !== undefined)
                        row = row.next();
                 }
             }
          });

          res.send("Your grade is " + grade);
          console.log(grade);
      }
   }); /* end of request */
}); /* end of /scrape route */



app.listen(3000, function(){
    console.log("Now serving your app on PORT 3000");
});
