const fs = require('fs');

exports.initializeData = async db => {
  fs.readFile('./initialData.json', 'utf8', async (err, data) => {
    if (err) throw err;
    let collections = JSON.parse(data);
    for (collection in collections) {
      let documents = await db[collection].find();
      if (documents.length === 0) {
        db[collection].insertMany(collections[collection]);
      }
    }
  });
};
