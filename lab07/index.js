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

// display the form
app.get('/pet/create', function(req,res){
    res.render('create_pet')
})

// process the form
app.post('/pet/create', async function(req,res){
    let petName = req.body.petName;
    let category = req.body.petCategory;

    let newPet = {
        "id": Math.floor(Math.random() * 100000 + 10000),
        "category": {
          "id": Math.floor(Math.random() * 1000000 + 100000),
          "name": category
        },
        "name": petName,
        "photoUrls": [
          "n/a"
        ],
        "tags": [
        ],
        "status": "available"
      }

      // save the new pet to the Pet API database
      // later we will replace saving to our own database
      let response = await axios.post(baseURL + "/pet", newPet);
      res.send(response.data);
})

// to display a form that shows the existing pet information
app.get('/pet/:petID/update', async function(req,res){
    // 1. fetch the existing pet information from the database
    let petID = req.params.petID;
    let response = await axios.get(baseURL + '/pet/' + petID);
  
    // 2. populate the form with the existing pet's information
    res.render('edit_pet',{
        'pet': response.data
    })

})

// update the pet (i.e, process the form)
app.post('/pet/:petID/update', async function(req,res){
   
    // fetech the existing pet information
    let response = await axios.get(baseURL + '/pet/' + req.params.petID);
    let oldPet = response.data;

    // fetch the new petName and the new petCategory
    let newPetName = req.body.petName;
    let newPetCategory = req.body.petCategory;

    let newPet = {
        "id": req.params.petID,
        "category": {
          "id": oldPet.category.id,
          "name": newPetCategory
        },
        "name": newPetName,
        "photoUrls": [
          "n/a"
        ],
        "tags": [
        ],
        "status": "available"
      }
      response = await axios.put(baseURL + '/pet', newPet);
      // go to the /pets URL
      res.redirect('/pets')
})

// display a confirmation form
app.get('/pet/:petID/delete', async function(req,res){
    let petID = req.params.petID;
    let response = await axios.get(baseURL + '/pet/' + petID);
    console.log(response);
    let pet = response.data;
    res.render('delete_pet', {
        'pet': pet
    })
})

// process the delete
app.post('/pet/:petID/delete', async function(req,res){
    let petID = req.params.petID;
    let response = await axios.delete(baseURL + '/pet/' + petID);
    res.redirect('/pets')
})


// 3. START SERVER
app.listen(3000, function(){
    console.log("Server has started")
})

