const express = require('express')
const multipart = require('connect-multiparty');
const multipartyMiddleware = multipart();
const fs = require('fs');

const app = express()
const port = 3001

const { MongoClient } = require('mongodb');

const { exportData } = require('./exportData');
const { insertData } = require('./importData');


app.use(express.static('public'));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/export', (req, res) => {

    const params = JSON.parse(Object.keys(req.body)[0])

    // Database Name
    const dbName = params.dbName;

    // collection Name
    const clName = params.clName

    // TODO: Connection exportClient URL, Such as SIT
    const url = 'mongodb://localhost:27017';
    const client = new MongoClient(url);

    // file Name
    const fileName = `${dbName}-${clName}.json`

    client.connect(err => {

        console.log('Connected successfully to server');
        const db = client.db(dbName);

        // export
        exportData(db, clName, docs => {

            console.log('Closing connection.');
            client.close();

            try {
                 // json to Buffer
                const json = JSON.stringify(docs);
                const buf = Buffer.from(json);
                res.writeHead(200, {
                    'Content-Type': 'application/octet-stream',
                    'Content-disposition': `attachment; filename=${fileName}`
                });
                res.write(buf);
                res.end();

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

    // Connection importClient URL, Such as local
    const url = 'mongodb://localhost:27017';
    const client = new MongoClient(url);

    // file exist
    if(req.files.myfile && req.files.myfile.size !== 0){
        client.connect(err => {

            const [dbName, clName] = req.files.myfile.originalFilename.split('.')[0].split('-')

            console.log('Connected successfully to server');
    
            const db = client.db(dbName);
    
            const path = req.files.myfile.path
            // import
            const data = fs.readFileSync(path)
            const docs = JSON.parse(data.toString());
    
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
