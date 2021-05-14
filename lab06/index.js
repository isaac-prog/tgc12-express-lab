// include express, hbs and wax-on
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

// 1. create the express app
let app = express();

// 1b. set the view engine
app.set('view engine', 'hbs');

// 1c. set up the wax on
wax.on(hbs.handlebars);

// this is where HBS will look for any file
// that we are extending from
wax.setLayoutPath('./views/layouts')

// 2. ROUTES
app.get('/', function(req,res){
    res.render('index')
})

app.get('/about-us', function(req,res){
    res.render('about-us')
})
// 3. START SERVER
app.listen(3000, function(){
    console.log("Server has started")
})

