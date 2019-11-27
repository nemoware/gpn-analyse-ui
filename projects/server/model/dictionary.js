module.exports = (mongoose, Schema) => {
  let dictionarySchema = new Schema({
    _id: String,
    values: [Object]
  });

  return mongoose.model('dictionary', dictionarySchema);
};
