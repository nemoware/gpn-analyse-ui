module.exports = (mongoose, Schema) => {
  let bookValueSchema = new Schema({
    date: Date,
    value: Number
  });
  return mongoose.model('BookValue', bookValueSchema);
};
