const fs = require('fs');

exports.initializeData = db => {
  fs.readFile('./json/initialData.json', 'utf8', async (err, data) => {
    if (err) throw err;
    let collections = JSON.parse(data);
    for (let collection in collections) {
      if (collection in db) {
        let documents = await db[collection].find();
        if (documents.length === 0) {
          db[collection].insertMany(collections[collection]);
        }
      }
    }
  });
};
