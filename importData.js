
const insertData = async (db, collectionName, docs, callback) => {
  db.collection(collectionName)
    .insertMany(docs, (err, result) => {
        if (err) throw err;
        console.log('Inserted docs:', result.insertedCount);
        callback()
  });
}

module.exports = { insertData }