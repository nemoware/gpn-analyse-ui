const fs = require('fs-promise');

exports.initializeData = async db => {
  const content = await fs.readFile('./json/initialData.json', 'utf8');
  const data = JSON.parse(content);
  for (let collection of data) {
    if (collection.name in db) {
      let documents = await db[collection.name].find();
      if (documents.length === 0) {
        await db[collection.name].insertMany(collection.values);
      }
    }
  }
};
