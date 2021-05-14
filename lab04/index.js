const express = require('express')
const hbs = require('hbs')
const wax = require('wax-on')

// 1. setup express
let app = express();

// 2. setup the view engine
app.set('view engine', 'hbs')

// 2b. setup static files
app.use(express.static('public'))

// 2c. setup wax-on (for template inheritance)
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts')

hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// ROUTES HERE!
app.get('/', function(req,res){
    res.render('index.hbs')
})

app.get('/hello/:name', function(req,res){
    let name = req.params.name;
    let luckyNumber = Math.floor(Math.random() * 1000)
    res.render('greetings.hbs', {
        'yourName': name,
        'lucky': luckyNumber
    })

})

app.get('/fruits', function(req,res){
    let favourite="apples";
    res.render('fruits.hbs', {
        'fruits':['apples', 'bananas', 'oranges'],
        'favouriteFruit': favourite
    })
})

// 3. Run server
app.listen(3000, ()=>{
    console.log("Server started")
})