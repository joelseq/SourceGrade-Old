/*Required variables*/
var async = require("async"); //To make asynchronous requests
var express = require("express"); //The main man
var cheerio = require("cheerio"); //To select HTML elements
var request = require("request"); //To get the url passed in by the user and turn it into html
var bodyParser = require("body-parser"); //To get post information

var app = express();

//Tell express to use bodyParser
app.use(bodyParser.urlencoded({extended: true}));

//Set the view engine to ejs
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));



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
   
   //Arrays of grade objects
   var grades = [];
   var csGrades = [];
   var asGrades = [];
   
   var coursestand, asLink;
   
   //Array of async functions
   var asyncTasks = [];
   
   //Boolean for if id is found
   var idFound = false;
   
   /* This will be the first request */
   request(url, function(error, response, html){
      if(error) {
          console.log(error);
      } else {
          if(!url.endsWith('index.html')){
              res.render("error");
          } else {
              var $ = cheerio.load(html);
          
              var baseUrl = replaceUrl(1, url); //The 1 is just for the paramater
              
              var tables = $('center>table');
              
              var table;
              
              tables.each(function() {
                  if($(this).attr("width", "50%"))
                    table = $(this);
              });
              
              coursestand = baseUrl + "coursestand.html";
              
              //Filter out the table to reach the anchor tags
              table.filter(function(){
                    var table = $(this);
                    //Get the tr containing the td we need
                    var tr = table.children().last();
                    //Get the td containing all the anchors we need
                    var td = tr.children().last();
                    //Find all the anchors
                    var anchors = td.find("a");
                    
                    /* Get one assessment anchor */
                    var anchor;
    
                    anchors.each(function(i, elem){
                        var ahref = $(this).attr("href");
                        if(ahref.includes('as')) {
                            anchor = baseUrl + ahref;
                            return false;
                        }
                    });
                    
                    asLink = anchor;
                    
                    
                    
                    // //For each anchor get the href
                    // anchors.each(function(i, elem){
                    //   var ahref = $(this).attr("href");
                    //   var catUrl = baseUrl + ahref;
                    //   //Create grade object for that specific anchor
                    //   var grade = {
                    //       name: $(this).text(),
                    //       url: catUrl,
                    //       rank: "",
                    //       points: "",
                    //       score: ""
                    //   };
                    //   grades.push(grade);
                    //   asyncTasks.push(function(done){
                    //       request(grade.url, function(error,response,html){
                    //           if(error){
                    //                 res.render("error");
                    //                 console.log(error);
                    //             } else {
                    //                 var $ = cheerio.load(html);
                                    
                    //                 //Filter out the table containing the scores
                    //                 $('table').attr('cellpadding', '3').filter(function(){
                    //                     //Set this as table
                    //                     var table = $(this);
                    //                     //Get the first row of that table
                    //                     var row = table.children().first();
                    //                     //Loop through all the rows to find the row containing the ID
                    //                     for(var i = 0; i < table.children().length; i++){
                    //                         if(row.children().first().text() === id){
                    //                             var index;
                    //                             var items = [];
                    //                             var child = row.children().first();
                    //                             //Loop through the children of the row
                    //                             //to find the highlighted ones
                    //                             for(var j = 0; j < row.children().length; j++) {
                    //                                 if(child.attr('bgcolor') === '#FFFFD0') {
                    //                                     index = j;
                    //                                     items.push(child.text());
                    //                                 }
                    //                                 child = child.next();
                    //                             }
                    //                             //If 3 items, there is rank, points, and score
                    //                             if(items.length === 3) {
                    //                                 grade.rank = items[0];
                    //                                 grade.points = items[1];
                    //                                 grade.score = items[2];
                    //                                 //Get to the 3rd row
                    //                                 var mainRow = table.children().eq(2);
                    //                                 var pointsColumn = mainRow.children().eq(index-1);
                    //                                 grade.points+=" / " + pointsColumn.text();
                    //                                 var scoreColumn = mainRow.children().eq(index);
                    //                                 grade.score+="/" + scoreColumn.text();
                    //                             } else {
                    //                                 grade.rank = items[0];
                    //                                 grade.score = items[1];
                    //                                 var mainRow = table.children().eq(2);
                    //                                 var scoreColumn = mainRow.children().eq(index);
                    //                                 grade.score+= " / " + scoreColumn.text();
                    //                             }
                    //                             //Exit out of loop
                    //                             break;
                                                
                    //                         } else {
                    //                             row = row.next();
                    //                         }
                    //                     } /* end of for loop */
                                        
                                        
                    //                 }); /* end of filter */
                                    
                                    
                    //             } /* end of else */
                    //          done();
                    //       }, function(err){
                    //               if(err){
                    //                   console.log(err);
                    //               }
                    //     });
                    //   });
                    // }); /* end of for each */
                
              }); /* end of filter */
              
            
            //Add the request for the categories url
            asyncTasks.push(function(done){
                request(coursestand, function(error,response,html){
                    if(error){
                        res.render("error");
                        console.log(error);
                    } else {
                        var $ = cheerio.load(html);
                        //Filter out the table containing the scores
                        $('table').attr('cellpadding', '3').filter(function(){
                            //Set this as table
                            var table = $(this);
                            //Get the first row of that table
                            var row = table.children().first();
                            console.log("" + row);
                            console.log("The number of children of the row is: " + row.children().length);
                            //Keep track of the number of categories
                            var categories = row.children().length - 2;
                            //Start from the 3rd td in that row
                            var td = row.children().first().next().next();
                            
                            //Loop through the entire row, store the info of
                            //each td
                            for(var i = 0; i < categories; i++) {
                                //Create the grade object and push it to the
                                //csGrades array
                                var grade = {
                                    name: td.text(),
                                    colspan: td.attr('colspan')
                                };
                                csGrades.push(grade);
                                td = td.next();
                            }
                            
                            //Variable for row with target id
                            var targetRow = row;
                            
                            //Find row with target id
                            for(i = 0; i < table.children().length; i++) {
                                if(targetRow.children().first().text() === id){
                                    idFound = true;
                                    break;
                                } else {
                                    targetRow = targetRow.next();
                                }
                            }
                            
                            //Get the second row of that table
                            row = row.next();
                            //Get row containing limits
                            var limitsRow = row.next();
                            
                            //Td holding the property name
                            td = row.children().first().next().next();
                            //Tds holding property value
                            var targetTd = targetRow.children().first().next().next();
                            var limitTd = limitsRow.children().first().next().next();
                            
                            //Variables used to get the properties for each grade
                            var j = 0;
                            var count = parseInt(csGrades[0].colspan, 10);
                            
                            //Loop through the row getting the properties
                            for(i = 0; i < row.children.length - 2; i++) {
                                if(count == 0) {
                                    j++;
                                    count = parseInt(csGrades[j].colspan, 10);
                                }
                                var propName = td.text();
                                var propValue = targetTd.text();
                                if(limitTd.text() != "&nbsp;") {
                                    propValue+= " / " + limitTd.text();
                                }
                                csGrades[j][propName] = propValue;
                                count--;
                            }
                            
                        }); /* end of filter */
                        
                    } /* end of else */
                    done();
                  }, function(err){
                          if(err){
                              console.log(err);
                          }
                });
            });
            
            //Add the request to the assessments url
            asyncTasks.push(function(done){
                request(asLink, function(error,response,html){
                    if(error){
                        res.render("error");
                        console.log(error);
                    } else {
                        var $ = cheerio.load(html);
                        //Filter out the table containing the scores
                        $('table').attr('cellpadding', '3').filter(function(){
                            //Set this as table
                            var table = $(this);
                            //Get the first row of that table
                            var row = table.children().first();
                            //Keep track of the number of categories
                            var categories = row.children().length - 2;
                            //Start from the 3rd td in that row
                            var td = row.children().first().next().next();
                            
                            //Loop through the entire row, store the info of
                            //each td
                            for(var i = 0; i < categories; i++) {
                                //Create the grade object and push it to the
                                //csGrades array
                                var grade = {
                                    name: td.text(),
                                    colspan: td.attr('colspan')
                                };
                                asGrades.push(grade);
                                td = td.next();
                            }
                            
                            //Variable for row with target id
                            var targetRow = row;
                            
                            //Find row with target id
                            for(i = 0; i < table.children().length; i++) {
                                if(targetRow.children().first().text() === id){
                                    idFound = true;
                                    break;
                                } else {
                                    targetRow = targetRow.next();
                                }
                            }
                            
                            //Get the second row of that table
                            row = row.next();
                            //Get row containing limits
                            var limitsRow = row.next();
                            
                            //Td holding the property name
                            td = row.children().first().next().next();
                            //Tds holding property value
                            var targetTd = targetRow.children().first().next().next();
                            var limitTd = limitsRow.children().first().next().next();
                            
                            //Variables used to get the properties for each grade
                            var j = 0;
                            var count = parseInt(asGrades[0].colspan, 10);
                            
                            //Loop through the row getting the properties
                            for(i = 0; i < row.children.length - 2; i++) {
                                if(count == 0) {
                                    j++;
                                    count = parseInt(asGrades[j].colspan, 10);
                                }
                                var propName = td.text();
                                var propValue = targetTd.text();
                                if(limitTd.text() != "&nbsp;") {
                                    propValue+= " / " + limitTd.text();
                                }
                                asGrades[j][propName] = propValue;
                                count--;
                            }
                            
                        }); /* end of filter */
                        
                    } /* end of else */
                    done();
                  }, function(err){
                          if(err){
                              console.log(err);
                          }
                });
            });
              
              

              
            // Now we have an array of functions doing async tasks
            // Execute all async tasks in the asyncTasks array
            async.parallel(asyncTasks, function(err){
              if(err) {
                  console.log(err);
              } else {
                  // All tasks are done now
                  console.log("Done parsing grades");
                  grades = csGrades.concat(asGrades);
                  res.render("scrape",{grades: grades});   
              }
            });
              
              
          } /* end of inner else */
          
      } /* end of gigantic else */
      
   }); /* end of request */
   
}); /* end of /scrape route */

app.get("*", function(req,res) {
   res.send("The page you are looking for doesn't exist"); 
});



/* Function to get the base url */
function replaceUrl(i, url) {
    var str = url.substr(url.lastIndexOf('/') + 1) + '$';
    return url.replace( new RegExp(str), '' );
}


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Now serving your app!");
});
