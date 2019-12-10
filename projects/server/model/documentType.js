module.exports = (mongoose, Schema) => {
  let documentTypeSchema = new Schema({
    _id: String,
    attributes: [Object]
  });

  return mongoose.model('documentType', documentTypeSchema);
};
