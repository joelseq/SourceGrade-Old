const mongoose = require('mongoose'),
      express  = require('express'),
      async    = require('async'),
      request  = require('request'), //Gets URL passed in and turns it into html
      cheerio  = require('cheerio'), //To select HTML elements like jQuery
      router   = express.Router();

/* Function to get the base url */
function replaceUrl(i, url) {
  var str = url.substr(url.lastIndexOf('/') + 1) + '$';
  return url.replace( new RegExp(str), '' );
}


router.get("/", function(req,res) {
  res.render("home");
});

router.get("/scrape", function(req,res) {
  const id = req.query.id;
  const url = req.query.url;

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
              var tables = $('table');

              var table;

              tables.each(function() {
                if($(this).attr("cellpadding", "3"))
                  table = $(this);
              });

              table.filter(function(){
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
                    colspan: td.attr('colspan'),
                    name: td.text()
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

                var columns = row.children().length - 2;

                //Td holding the property name
                td = row.children().first().next().next();
                //Tds holding property value
                var targetTd = targetRow.children().first().next().next();
                var limitTd = limitsRow.children().first().next().next();

                //Variables used to get the properties for each grade
                var j = 0;
                var count = parseInt(csGrades[0].colspan, 10);

                //Loop through the row getting the properties
                for(i = 0; i < columns; i++) {
                  if(count == 0) {
                    j++;
                    count = parseInt(csGrades[j].colspan, 10);
                  }
                  var propName = td.text();
                  var propValue = targetTd.text();
                  if(limitTd.text() != String.fromCharCode(160)) {
                    propValue+= " / " + limitTd.text();
                  }
                  csGrades[j][propName] = propValue;
                  td = td.next();
                  limitTd = limitTd.next();
                  targetTd = targetTd.next();
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
              var tables = $('table');

              var table;

              tables.each(function() {
                if($(this).attr("cellpadding", "3"))
                  table = $(this);
              });

              table.filter(function(){
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
                    colspan: td.attr('colspan'),
                    name: td.text()
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

                var columns = row.children().length - 2;

                //Td holding the property name
                td = row.children().first().next().next();
                //Tds holding property value
                var targetTd = targetRow.children().first().next().next();
                var limitTd = limitsRow.children().first().next().next();

                //Variables used to get the properties for each grade
                var j = 0;
                var count = parseInt(asGrades[0].colspan, 10);


                //Loop through the row getting the properties
                for(i = 0; i < columns; i++) {
                  if(count == 0) {
                    j++;
                    count = parseInt(asGrades[j].colspan, 10);
                  }
                  var propName = td.text();
                  var propValue = targetTd.text();
                  if(limitTd.text() != String.fromCharCode(160)) {
                    propValue+= " / " + limitTd.text();
                  }
                  asGrades[j][propName] = propValue;
                  td = td.next();
                  limitTd = limitTd.next();
                  targetTd = targetTd.next();
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
});

module.exports = router;

