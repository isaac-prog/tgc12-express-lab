// include express, hbs and wax-on
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');
const axios = require('axios');

// 1. create the express app
let app = express();

// 1b. set the view engine
app.set('view engine', 'hbs');

// 1c. set up the wax on
wax.on(hbs.handlebars);

// this is where HBS will look for any file
// that we are extending from
wax.setLayoutPath('./views/layouts')

// enable forms
// ULTRA-IMPORTANT
app.use(express.urlencoded({
    extended: false
}))

const baseURL = "https://petstore.swagger.io/v2";

// ROUTES
app.get('/pets', async function(req,res){
    // same as axios.ge(baseURL + '/pet/findByStatus?status=available)
    let response = await axios.get(baseURL + '/pet/findByStatus', {
        params: {
            'status':'available'
        }
    });
    res.render('pets',{
        'allPets': response.data
    })
})

// 3. START SERVER
app.listen(3000, function(){
    console.log("Server has started")
})

