const express = require('express')
const multipart = require('connect-multiparty');
const multipartyMiddleware = multipart();

const app = express()
const port = 3001

const { MongoClient } = require('mongodb');
// or as an es module:
// import { MongoClient } from 'mongodb'
const fs = require('fs');

const { exportData } = require('./exportData');
const { insertData } = require('./importData');

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

// collection Name
const clName = 'outCollection'

// file Name
const fileName = 'out_file.json'

app.use(express.static('public'));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get('/export', (req, res) => {

    client.connect(err => {

        console.log('Connected successfully to server');
        const db = client.db(dbName);

        // export
        exportData(db, clName, docs => {

            console.log('Closing connection.');
            client.close();

            // Write to file
            try {
                fs.writeFileSync(fileName, JSON.stringify(docs));
                res.status(200)
                res.send('Done writing to file')

                console.log('Done writing to file.');
            }
            catch (err) {
                res.status(400);
                console.log('Error writing to file', err)
            }
        });

    })

});

app.post('/import', multipartyMiddleware, (req, res) => {

    // console.log(req.headers)

    console.log(req.files)

    // file exist
    if(req.files?.myfile?.size){
        client.connect(err => {

            console.log('Connected successfully to server');
    
            const db = client.db(dbName);
    
            const path = req.files.myfile.path
            // import
            const data = fs.readFileSync(path)
            const docs = JSON.parse(data.toString());
            // const docs = req.body;
    
            insertData(db, clName, docs, () => {
                res.status(200)
                res.json(docs)
    
                console.log('Closing connection.');
                client.close();
    
            })
        })
    } else {
        res.status(400);
        res.send('no data')
    }
    
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
