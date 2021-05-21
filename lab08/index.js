const express = require('express')
const hbs = require('hbs')
const wax = require('wax-on')
const ObjectId = require('mongodb').ObjectId;
// require('dotenv').config();

// transfer all the variables
// in .env to process.env so that
// we can refer to it later
const dotenv = require('dotenv');
dotenv.config();

// require in MongoUtil
const MongoUtil = require('./MongoUtil')

const helpers = require('handlebars-helpers');

async function getFoodById(id) {
    let db = MongoUtil.getDB();
    return await db.collection('food').findOne({
        "_id":ObjectId(id)
    })
}

async function main() {

    // 1. create the express application
    let app = express();

    // 2. set the view engine
    app.set('view engine', 'hbs')

    // 2b. initialise handlebars-helpers
    // const helpers = require('handlebars-helpers')({
    //     'handlebars': hbs.handlebars
    // })
   
    helpers({
        'handlebars': hbs.handlebars
    })

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
    app.get('/', (req, res) => {
        res.send("Hello World")
    })

    app.get('/food/add', (req, res) => {
        res.render('add_food')
    })

    app.post('/food/add', async (req, res) => {
        // let foodName = req.body.foodName;
        // let calories = req.body.calories;

        let { foodName, calories, tags } = req.body;

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

        res.redirect('/food')

    })

    app.get('/food', async (req, res) => {
        let db = MongoUtil.getDB();
        // find all the food and convert the results to an array
        let results = await db.collection('food').find().toArray();
        res.render('food', {
            'foodRecords': results
        })
    })

    // display the form to edit a food item
    app.get('/food/:foodid/edit', async (req, res) => {
        let db = MongoUtil.getDB();
        let foodId = req.params.foodid;
        // findOne will always give you back one object
        let foodRecord = await db.collection('food').findOne({
            "_id": ObjectId(foodId)
        })

        if(! Array.isArray(foodRecord.tags)) {
            foodRecord.tags = [];
        }

        res.render('edit_food',{
            foodRecord
        })
    })

    app.post('/food/:foodid/edit', async (req,res)=>{
        let {foodName, calories, tags} = req.body;
        let foodId = req.params.foodid;
        // convert the tags
        tags = tags || [];
        tags = Array.isArray(tags) ? tags : [tags];

        // update the document
        let db = MongoUtil.getDB();
        await db.collection('food').updateOne({
            '_id':ObjectId(foodId)
        },{
            '$set': {
                foodName, calories, tags
            }
        })
        res.redirect('/food')
    })

    app.get('/food/:foodid/delete', async (req,res)=>{
        let db = MongoUtil.getDB();

        let foodRecord = await db.collection('food').findOne({
            '_id':ObjectId(req.params.foodid)
        })

        res.render('delete_food',{
            foodRecord
        })
    })

    app.post('/food/:foodid/delete', async(req,res)=>{
        let db = MongoUtil.getDB();
        await db.collection('food').deleteOne({
            '_id':ObjectId(req.params.foodid)
        })

        res.redirect('/food')
    })

    // render a form that allows the user to add note
    app.get('/food/:foodid/notes/add', async (req,res)=>{
        let db = MongoUtil.getDB();
        let foodRecord = await getFoodById(req.params.foodid)

        res.render('add_note',{
            'food': foodRecord
        })
    })

    app.post('/food/:foodid/notes/add', async(req,res)=>{
        let db = MongoUtil.getDB();
        let noteContent = req.body.content;
        await db.collection('food').updateOne({
            '_id': ObjectId(req.params.foodid)
        },{
            '$push':{
                'notes':{
                    '_id':ObjectId(),
                    'content': noteContent
                }
            }
        })
        res.redirect('/food')
    })

    // see the notes and details of a food document
    app.get('/food/:foodid', async(req,res)=>{
        let db = MongoUtil.getDB();
        let foodRecord = await getFoodById(req.params.foodid);
        res.render('food_details',{
            'food': foodRecord
        })
    })

    // display the form to update a note
    app.get('/notes/:noteid/edit', async(req,res)=>{
        let db = MongoUtil.getDB();
        let foodRecord = await db.collection('food').findOne({
            "notes._id":ObjectId(req.params.noteid)
        },{
            'projection':{
                'notes': {
                    '$elemMatch': {
                        '_id':ObjectId(req.params.noteid)
                    }
                }
            }
        })
        let noteToEdit = foodRecord.notes[0];
        res.render('edit_note',{
            'note': noteToEdit
        })
    })

    app.post('/notes/:noteid/edit', async (req,res)=>{
        let db = MongoUtil.getDB();

        let foodRecord = await db.collection('food').findOne({
            "notes._id":ObjectId(req.params.noteid)
        });

        await db.collection('food').updateOne({
            'notes._id':ObjectId(req.params.noteid)
        },{
            '$set':{
                'notes.$.content':req.body.content
            }
        })

        res.redirect('/food/'+foodRecord._id);
    })

    // 8. start the server
    app.listen(3000, () => {
        console.log("Server has started")
    })
}

main();