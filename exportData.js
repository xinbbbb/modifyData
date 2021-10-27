const exportData = async (db, collectionName, callback) => {

  const query = { };  // this is your query criteria

  db.collection(collectionName)
    .find()
    .toArray((err, result) => { 
        if (err) throw err; 
        callback(result); 
  }); 
};

module.exports  = { exportData }