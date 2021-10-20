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

client.connect(err => {

  console.log('Connected successfully to server');
  
  const db = client.db(dbName);

  // export
  exportData(db, clName, (docs) => {
  
      console.log('Closing connection.');
      client.close();
      
      // Write to file
      try {
          fs.writeFileSync(fileName, JSON.stringify(docs));
          console.log('Done writing to file.');
      }
      catch(err) {
          console.log('Error writing to file', err)
      }
  });

  // // import
  // const data = fs.readFileSync(fileName)
  // const docs = JSON.parse(data.toString());

  // insertData(db, clName, docs, ()=> {

  //   console.log('Closing connection.');
  //   client.close();

  // })

})