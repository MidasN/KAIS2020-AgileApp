const fs = require('fs')
const express = require('express');
const expressApp = express();
const MongoClient = require('mongodb').MongoClient; //getting the MongoClient class to manage the interactions
const dbUrl = 'mongodb://localhost:27017/agileAppDB'; //the database you want to connect to
const dbName = 'agileAppDB';

function addToDb(data, collection) {
    MongoClient.connect(dbUrl,
        {useUnifiedTopology: true},
        function(error, db) {
            if (error) throw err;

            let databaseobject = db.db(dbName);
            databaseobject.collection(collection).insertOne(data,
                function(err, res){
                    if (err) throw err;
                    console.log("1 document inserted");
                    db.close();
                })
        });
}


expressApp.use(function(request, response, next) {
    let log = {
        "date": Date.now(),
        "ip": request.ip,
        "url": request.originalUrl,
        "user-agent": request.headers['user-agent']
    };

    addToDb(log, 'log');
    next();
});

expressApp.use(express.static(__dirname + '/public'));

expressApp.get('/',  function(request, response) {
    response.sendFile(__dirname + '/public/index.html')
});

expressApp.get('/agile-app',  function(request, response) {
    response.sendFile(__dirname + '/public/agile-app.html')
});

expressApp.get('/about',  function(request, response) {
    response.sendFile(__dirname + '/public/about.html')
});

expressApp.get('/get-data', function (request, response) {

   let query = request.query.id;
   let collection = request.query.collection;

    MongoClient.connect(dbUrl,
        {useUnifiedTopology: true},
        function(error, db) {
            if (error) {
                throw err;
            }
            let databaseobject = db.db(dbName);

            databaseobject.collection(collection).find(query).toArray(function(err, result) {
                if (err) throw err;
                console.log(result)
                response.send({collection: collection, result: result})
                db.close();

            });
        });

});

expressApp.listen(8080, function() {
});
