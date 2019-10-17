module.exports = (mongoose, Schema) => {
  let documentTypeSchema = new Schema({
    _id: String,
    attributes: [String]
  });

  return mongoose.model('documentType', documentTypeSchema);
};
