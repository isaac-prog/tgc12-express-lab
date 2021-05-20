const express = require('express')
const hbs = require('hbs')
const wax = require('wax-on')
// require('dotenv').config();

// transfer all the variables
// in .env to process.env so that
// we can refer to it later
const dotenv = require('dotenv');
dotenv.config();

// require in MongoUtil
const MongoUtil = require('./MongoUtil')

async function main() {

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

// 6. connect to Mongo
await MongoUtil.connect(process.env.MONGO_URI, 'food_tracker');

// 7. Define the routes

// root route
app.get('/', (req,res)=> {
    res.send("Hello World")
})

app.get('/food/add', (req,res)=>{
    res.render('add_food')
})

app.post('/food/add', async (req,res)=>{
    // let foodName = req.body.foodName;
    // let calories = req.body.calories;

    let {foodName, calories, tags} = req.body;

    // check if tags is undefined. If undefined, set it to be an empty array
    tags = tags || [];

    // if tag is a single value, convert it to be an array consisting of the value
    // as its only element
    tags = Array.isArray(tags) ? tags : [tags]

    // assume the tags variable contains "snack"
    // tags = Array.isArray(tags) ? tags : [tags]
    //      => Array.isArray("snack") ? "snack" : ["snack"]
    //      => false ? "snack" : ["snack"]
    //      => ["snack"]
    // tags => ["snack"]

    // assume the tags variable contains ["unhealthy", "homecooked"]
    // tags = Array.isArray(tags) ? tags : [tags]
    //      => Array.isArray(["unhealthy", "homecooked"]) ? ["unhealthy", "homecooked"] : [["unhealthy", "homecooked"]]
    //      => true ? ["unhealthy", "homecooked"] : [["unhealthy", "homecooked"]]
    //      => ["unhealthy", "homecooked"] 
    // tags = ["unhealthy", "homecooked"]

    let db = MongoUtil.getDB();

    await db.collection('food').insertOne({
       foodName, calories, tags
    });

    res.send("Food added")

})

// 8. start the server
app.listen(3000, ()=>{
    console.log("Server has started")
})
}

main();