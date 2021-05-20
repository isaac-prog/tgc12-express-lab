const express = require('express')
const hbs = require('hbs')
const wax = require('wax-on')

// 1. create the express application
let app = express();

// 2. set the view engine
app.set('view engine', 'hbs')

// 3. where to find the public folder
app.use(express.static('public'))

// 4. set up wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts')

// 5. set up forms
app.use(express.urlencoded({
    extended: false
}))

// 6. routes

// root route
app.get('/', (req,res)=> {
    res.send("Hello World")
})

// 7. start the server
app.listen(3000, ()=>{
    console.log("Server has started")
})