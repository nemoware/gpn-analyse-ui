module.exports = (mongoose, Schema) => {
  let subsidiarySchema = new Schema({
    name: String
  });

  return mongoose.model('Subsidiary', subsidiarySchema);
};
