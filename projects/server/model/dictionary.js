module.exports = (mongoose, Schema) => {
  let dictionarySchema = new Schema({
    _id: String,
    values: [String]
  });

  return mongoose.model('dictionary', dictionarySchema);
};
