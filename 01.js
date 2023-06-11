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

// TO DO EX: 4, 7, 10, 11, 12

async function run() {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const noticesCollection = db.collection('notices');
    const allNotices = await noticesCollection.find().toArray();
    // EXERCISES

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
        } else{
            response.statusCode = 400;
            response.send('Wrong input!');
        }
    })

    //Exercise 4
    app.get('/getNotice/:id', (request, response) => {
        response.statusCode = 200;
        const findNoticeBasedOnID = allNotices.filter(
            notice => notice._id === request.params.id
        );

        if(findNoticeBasedOnID.length === 0){
            response.statusCode = 404;
            response.send('Notice not found');
        } else {
            response.statusCode = 200;
            response.send(findNoticeBasedOnID[0]);
        }
        response.send(request.params.id);
    })

    // Exercise 5
    app.get('/getNotices', (request, response) => {
        response.statusCode = 200;
        response.send(allNotices)
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
            response.send('Notice not found');
        } else {
            response.statusCode = 200;
            response.send(findNotice);
        }

    })

    // Exercise 10
    app.delete('/deleteNotice/', (request, response) => {
        response.statusCode = 200;
        if(request.query.password === process.env.PASSWORD_FOR_DELETE){
            // Exercise 6
            const findNoticeBasedOnID = allNotices.filter(
                notice => notice.id === request.query.id
            );
    
            if(findNoticeBasedOnID.length === 0){
                response.statusCode = 404;
                response.send('Notice not found');
            } else {
                response.statusCode = 204;
                noticesCollection.deleteOne({id: request.query.id});
                response.send('Notice deleted!');
            }
        } else {
            response.statusCode = 401;
            response.send(`Error ${response.statusCode}. Wrong password! Type password in query param!`)
        }
    })

    //Exercise 13
    app.get("*", (request, response) => {
        response.statusCode = 404;
        response.sendFile(__dirname + '/404NotFound.png');
    });

    
}
run().then().catch(console.error).finally(client.close());

// Exercise 2
app.get('/heartbeat', (request, response) => {
    let currentDate = new Date();
    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1;
    let year = currentDate.getFullYear();
    response.write('Current date: ' + day + "-" + month + "-" + year);
    response.end();
})


//Exercise 7 TO DO!!!
app.put('/updateNotice', (request, response) => {
    response.statusCode = 200;
    const updateTitle = request.query.title;
    notices.update({title: 'Test value'}, {title: updateTitle}, (error, response) => {
        if(error){
            response.send(error);
        } else {
            response.send({statusCode: 200, notices: response})
        }
    })
})

//Exercise 10

app.listen(process.env.SERVER_PORT, console.log('Server started'));