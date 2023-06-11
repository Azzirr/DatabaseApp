const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const express = require('express');
const crypto = require('crypto');

const app = express();
const uri = process.env.CONNECTION_STRING;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const noticesCollection = db.collection('notices');
    const allNotices = await noticesCollection.find().toArray();
    // EXERCISES!

    // Exercise 2
    app.get('/heartbeat', (request, response) => {
        try {
            let currentDate = new Date();
            let day = currentDate.getDate();
            let month = currentDate.getMonth() + 1;
            let year = currentDate.getFullYear();
            response.write('Current date: ' + day + "-" + month + "-" + year);
            app.use((request, response, next) => {
                response.statusCode = 500;
                response.send('Error' + response.statusCode)
            })
            response.end();
        } catch (error) {
            throw error;
        }
    })

    // Exercise 3 and Exercise 9
    let notices = [];
    app.post('/add', (request, response) => {
        if(request.query.title && request.query.author && request.query.category && request.query.tags && request.query.price){
            const newNotice = {
                id: crypto.randomBytes(20).toString('hex'),
                title: request.query.title,
                author: request.query.author,
                category: request.query.category,
                tags: request.query.tags,
                price: request.query.price
            }
            notices.push(newNotice);
            response.statusCode = 201;
            response.send(notices);
            noticesCollection.insertMany(notices);
            notices = [];
        } else{
            response.statusCode = 400;
            response.send(`Error ${response.statusCode}. Wrong input!`);
        }
        app.use((request, response, next) => {
            response.statusCode = 500;
            response.send('Error' + response.statusCode)
        })
    })

    //Exercise 4
    app.get('/getNotice/:id', (request, response) => {
        response.statusCode = 200;
        const findNoticeBasedOnID = allNotices.filter(
            notice => notice.id === request.params.id
        );

        if(findNoticeBasedOnID.length === 0){
            response.statusCode = 404;
            response.send(`Error ${response.statusCode}. Notice not found`);
        } else {
            response.statusCode = 200;
            if(request.accepts('text/plain')){
                response.format({
                text: function () {
                    response.send(findNoticeBasedOnID[0]);
                }})
            } else if(request.accepts('text/html')){
                response.format({
                    html: function () {
                        response.send(findNoticeBasedOnID[0]);
                }})
            } else if(request.accepts('application/json')){
                response.format({
                    json: function () {
                        response.send(findNoticeBasedOnID[0]);
                }})
            } else {
                response.statusCode = 400;
                response.send(`Error ${response.statusCode}. Wrong "Accept" header`);
            }
        };
        app.use((request, response, next) => {
            response.statusCode = 500;
            response.send('Error' + response.statusCode)
        })
    })

    // Exercise 5
    app.get('/getNotices', (request, response) => {
        response.statusCode = 200;
        response.send(allNotices);
        app.use((request, response, next) => {
            response.statusCode = 500;
            response.send('Error' + response.statusCode)
        })
    })

    // Exercise 7 and Exercise 10
    app.patch('/updateNotice/:id', (request, response) => {
        if(request.query.password === process.env.PASSWORD){
            try {
                const filter = { id: request.params.id };
                //create if not exist
                const options = { upsert: true };
                const updateDoc = {
                $set: {
                    title: request.query.title,
                    author: request.query.author,
                    category: request.query.category,
                    tags: request.query.tags,
                    price: request.query.price
                },
                };
                if(request.query.title && request.query.author && request.query.category && request.query.tags && request.query.price){
                    noticesCollection.updateOne(filter, updateDoc, options);
                    response.send('Notice updated!');
                } else {
                    response.send('Please fill all fields to update object.')
                }
            } catch {
                throw error;
            }
        } else {
            response.statusCode = 401;
            response.send(`Error ${response.statusCode}. Wrong password! Type password in query param!`)
        }
        app.use((request, response, next) => {
            response.statusCode = 500;
            response.send('Error' + response.statusCode)
        })
    })

    //Exercise 8
    app.get('/searchNotice', (request, response) => {
        const queryTitle = request.query.title;
        const queryCategory = request.query.category;
        const queryMinPrice = request.query.minprice;
        const queryMaxPrice = request.query.maxprice;
        const queryAuthor = request.query.author;

        let findNotice;
        if (queryTitle) {
            response.statusCode = 200;
            findNotice = allNotices.filter(
                notice => notice.title === queryTitle
            );
        } else if(queryCategory){
            response.statusCode = 200;
            findNotice = allNotices.filter(
                notice => notice.category === queryCategory
            );
        } else if(queryMinPrice){
            response.statusCode = 200;
            findNotice = allNotices.filter(
                notice => notice.price >= queryMinPrice
            );
        } else if(queryMaxPrice){
            response.statusCode = 200;
            findNotice = allNotices.filter(
                notice => notice.price <= queryMaxPrice
            );
        } else if(queryAuthor){
            response.statusCode = 200;
            findNotice = allNotices.filter(
                notice => notice.price <= queryAuthor
            );
        }

        if(findNotice.length === 0){
            response.statusCode = 404;
            response.send(`Error ${response.statusCode}. Notice not found`);
        } else {
            response.statusCode = 200;
            response.send(findNotice);
        }
        app.use((request, response, next) => {
            response.statusCode = 500;
            response.send('Error' + response.statusCode)
        })
    })

    // Exercise 10
    app.delete('/deleteNotice/', (request, response) => {
        response.statusCode = 200;
        if(request.query.password === process.env.PASSWORD){
            // Exercise 6
            const findNoticeBasedOnID = allNotices.filter(
                notice => notice.id === request.query.id
            );
    
            if(findNoticeBasedOnID.length === 0){
                response.statusCode = 404;
                response.send(`Error ${response.statusCode}. Notice not found`);
            } else {
                response.statusCode = 204;
                noticesCollection.deleteOne({id: request.query.id});
                response.send('Notice deleted!');
            }
        } else {
            response.statusCode = 401;
            response.send(`Error ${response.statusCode}. Wrong password! Type password in query param!`)
        }
        app.use((request, response, next) => {
            response.statusCode = 500;
            response.send('Error' + response.statusCode)
        })
    })

    //Exercise 13
    app.get("*", (request, response) => {
        response.statusCode = 404;
        response.sendFile(__dirname + '/404NotFound.png');
        app.use((request, response, next) => {
            response.statusCode = 500;
            response.send('Error' + response.statusCode)
        })
    });

    
}
run().then().catch(console.error).finally(client.close());
// Exercise 1
app.listen(process.env.SERVER_PORT, console.log('Server started'));
