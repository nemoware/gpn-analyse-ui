const idata = require('../json/initialData');

exports.initializeData = async db => {
  for (let collection of idata.initialData) {
    if (collection.name in db) {
      let documents = await db[collection.name].find();
      if (documents.length === 0) {
        await db[collection.name].insertMany(collection.values);
      }
    }
  }
};
