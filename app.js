/*Required variables*/
var async = require("async"); //To make asynchronous requests
var express = require("express"); //MVP
var cheerio = require("cheerio"); //To select HTML elements
var request = require("request"); //To get the url passed in by the user and turn it into html
var bodyParser = require("body-parser"); //To get post information

var app = express();

//Tell express to use bodyParser
app.use(bodyParser.urlencoded({extended: true}));

//Set the view engine to ejs
app.set("view engine", "ejs");



/* ====================================================
                        ROUTES
   ==================================================== */

/* Get route for home page */
app.get("/", function(req,res) {
   res.render("home");
});

/* Post route that scrapes the data of the grades */
app.post("/scrape", function(req, res) {

   var id = req.body.sourceid;
   url = req.body.sourceurl;
   
   var hyperlinks = [];
   var categories = [];
   var toReturn;
   
   
   /* This will be the first request */
   request(url, function(error, response, html){
      if(error) {
          console.log(error);
      } else {
          var $ = cheerio.load(html);
          
          var baseUrl = replaceUrl(1, url); //The 1 is just for the paramater
          
          var tables = $('center>table');
          
          var table;
          
          tables.each(function() {
              if($(this).attr("width", "50%"))
                table = $(this);
          });
          
          //Ridiculously specific selector to get the right a tags
          table.filter(function(){
                var table = $(this);
                //Get the tr containing the td we need
                var tr = table.children().last();
                //Get the td containing all the anchors we need
                var td = tr.children().last();
                //Find all the anchors
                var anchors = td.find("a");
                //For each anchor get the href
                anchors.each(function(i, elem){
                   var ahref = $(this).attr("href");
                   console.log(ahref);
                   var catUrl = baseUrl + ahref;
                   console.log(catUrl);
                   hyperlinks.push(catUrl);
                   var categoryName = $(this).text();
                   categories.push(categoryName);
                }); /* end of for each */
            
          }); /* end of filter */
          
          async.each(hyperlinks, function(hyperlink, done){
              request(hyperlink, function(error, response, html){
                    if(error){
                        console.log(error);
                    } else {
                        var $ = cheerio.load(html);
                        
                        var rank; //user's rank
                        var points; //user's points
                        var score; //user's score (percentage)
                        
                        var grade = new Object(); //Object that will hold grade information
                        
                        //Filter out the table containing the scores
                        $('table').attr('cellpadding', '3').filter(function(){
                            //Set this as table
                            var table = $(this);
                            //Get the first row of that table
                            var row = table.children().first();
                            //Loop through all the rows to find the row containing the ID
                            for(var i = 0; i < table.children().length; i++){
                                if(row.children().first().text() === id){
                                    console.log("ID found");
                                    $('row').children().attr('bgcolor', '#FFFFD0').filter(function(){
                                        //Get the NodeList of the children
                                        var tds = $(this);
                                        var td = tds.children().first();
                                        if(tds.length === 3){
                                            console.log("If statement entered");
                                            rank = td.text();
                                            td = td.next();
                                            points = td.text();
                                            td = td.next();
                                            score = td.text();
                                            grade.rank = rank;
                                            grade.points = points;
                                            grade.score = score;
                                            return;
                                        } else {
                                            console.log("Else statement entered");
                                            rank = td.text();
                                            td = td.next();
                                            score = td.text();
                                            grade.rank = rank;
                                            grade.score = score;
                                            return;
                                        }
                                    }); /* end of filter */
                                } else {
                                    row = row.next();
                                }
                            } /* end of for loop */
                            
            
                           if(grade.length === 3) {
                                toReturn += "For " + categories[i] + " you got rank " + grade.rank + 
                                            " with " + grade.points + " points and a score of " + grade.score + "\n";
                           } else {
                                toReturn += "For " + categories[i] + " you got rank " + grade.rank + 
                                            " with a score of " + grade.score + "\n";
                           }
                            
                            
                        }); /* end of filter */
                    } /* end of else */
                 
                 
                 
                 done(); 
              });
          }, function(err){
              console.log("Done parsing grades");
          });
          
      }
   }); /* end of request */
   
   
//   /* This will be the second stage of requests */
//   for(var i = 0; i < hyperlinks.length; i++) {
//       console.log("enterered the second for loop");
//       request(hyperlinks[i], function(error,response,html){
//             console.log("entered the second stage of requests");
//             if(error){
//                 console.log(error);
//             } else {
//                 var $ = cheerio.load(html);
                
//                 var rank; //user's rank
//                 var points; //user's points
//                 var score; //user's score (percentage)
                
//                 var grade = new Object(); //Object that will hold grade information
                
//                 //Filter out the table containing the scores
//                 $('table').attr('cellpadding', '3').filter(function(){
//                     //Set this as table
//                     var table = $(this);
//                     //Get the first row of that table
//                     var row = table.children().first();
//                     //Loop through all the rows to find the row containing the ID
//                     for(var i = 0; i < table.children().length; i++){
//                         if(row.children().first().text() === id){
//                             console.log("ID found");
//                             $('row').children().attr('bgcolor', '#FFFFD0').filter(function(){
//                                 //Get the NodeList of the children
//                                 var tds = $(this);
//                                 var td = tds.children().first();
//                                 if(tds.length === 3){
//                                     console.log("If statement entered");
//                                     rank = td.text();
//                                     td = td.next();
//                                     points = td.text();
//                                     td = td.next();
//                                     score = td.text();
//                                     grade.rank = rank;
//                                     grade.points = points;
//                                     grade.score = score;
//                                     return;
//                                 } else {
//                                     console.log("Else statement entered");
//                                     rank = td.text();
//                                     td = td.next();
//                                     score = td.text();
//                                     grade.rank = rank;
//                                     grade.score = score;
//                                     return;
//                                 }
//                             }); /* end of filter */
//                         } else {
//                             row = row.next();
//                         }
//                     } /* end of for loop */
                    
    
//                   if(grade.length === 3) {
//                         toReturn += "For " + categories[i] + " you got rank " + grade.rank + 
//                                     " with " + grade.points + " points and a score of " + grade.score + "\n";
//                   } else {
//                         toReturn += "For " + categories[i] + " you got rank " + grade.rank + 
//                                     " with a score of " + grade.score + "\n";
//                   }
                    
                    
//                 }); /* end of filter */
//             } /* end of else */
//         }); /* end of request */
//   } /* end of for loop */
   
  res.send(toReturn);
  console.log(toReturn);
   
}); /* end of /scrape route */



/* Function to get the base url */
function replaceUrl(i, url) {
    var str = url.substr(url.lastIndexOf('/') + 1) + '$';
    return url.replace( new RegExp(str), '' );
}


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Now serving your app!");
});
