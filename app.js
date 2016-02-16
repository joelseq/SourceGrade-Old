/*Required variables*/
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
   
   request(url, function(error, response, html){
      if(error) {
          console.log(error);
      } else {
          var $ = cheerio.load(html);
          
          var baseUrl = replaceUrl(1, url);
          
          var toReturn;
          
          var tables = $('center>table');
          
          var table;
          
          tables.each(function() {
              if($(this).attr("width", "50%"))
                table = $(this);
          });
          
          //Ridiculously specific selector to get the right a tags
          table.filter(function(){
                var table = $(this);
                var tr = table.children().last();
                var td = tr.children().last();
                var anchors = td.find("a");
                anchors.each(function(i, elem){
                   var ahref = $(this).attr("href");
                   var catUrl = baseUrl + ahref;
                   console.log(catUrl);
                   var categoryName = $(this).text();
                   var grade = new Object();
                   grade = getGrade(id, catUrl);
                   console.log(grade);
                   if(grade.length === 3) {
                    toReturn = "For " + categoryName + " you got rank " + grade.ra + 
                                " with " + grade.po + " points and a score of " + grade.sc + "\n";
                   } else {
                       toReturn = "For " + categoryName + " you got rank " + grade.ra + 
                                  " with a score of " + grade.sc + "\n";
                   }
                });
            
          }); /* end of filter */
          
          res.send(toReturn);
          console.log(toReturn);
          
          
      }
   }); /* end of request */
}); /* end of /scrape route */




/* ============================================================================
    function name: getGrade
    parameters: id -- the user's id
                url -- the url of the link to get the information from
    return: object containing the rank, points(optional), and score.
   ============================================================================ */
function getGrade(id, url) {
    console.log("Entered getGrade function");
    request(url, function(error,response,html){
        console.log("Entered request");
        if(error){
            console.log("Reached error");
            console.log(error);
        } else {
            console.log("reached here atleast!");
            var $ = cheerio.load(html);
            
            var rank; //user's rank
            var points; //user's points
            var score; //user's score (percentage)
            
            //Filter out the table containing the scores
            $('table').attr('cellpadding', '3').filter(function(){
                console.log("reached this far!");
                //Set this as table
                var table = $(this);
                //Get the first row of that table
                var row = table.children().first();
                //Boolean to check if ID was found
                var idFound = "false";
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
                                idFound = "true";
                                var returnVar = {ra: rank, po: points, sc: score};
                                console.log(returnVar);
                                return returnVar;
                            } else {
                                console.log("Else statement entered");
                                rank = td.text();
                                td = td.next();
                                score = td.text();
                                var returnVar = {ra: rank, sc: score};
                                console.log(returnVar);
                                return returnVar;
                            }
                        }); /* end of filter */
                    } else if(row.next() !== undefined) {
                        row = row.next();
                    } else {
                        console.log("id not found");   
                    }
                } /* end of for loop */
            }); /* end of filter */
        }
    }); /* end of request */
} /* end of function */



function replaceUrl(i, url) {
    var str = url.substr(url.lastIndexOf('/') + 1) + '$';
    return url.replace( new RegExp(str), '' );
}


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Now serving your app!");
});
