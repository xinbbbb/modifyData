const exportData = async (db, collectionName, callback) => {

  // db.collection(collectionName).deleteMany( {} )

  await db.collection(collectionName).insertOne({
    name: 'hello1 world',
    insertTime: Date.now()
  }).then(()=> {
    console.log('insert 成功') 
  })

  const query = { };  // this is your query criteria

  db.collection(collectionName)
    .find()
    .toArray((err, result) => { 
        if (err) throw err; 
        callback(result); 
  }); 
};

module.exports  = { exportData }