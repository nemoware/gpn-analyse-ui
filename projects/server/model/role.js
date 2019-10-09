module.exports = (mongoose, Schema) => {
  let roleSchema = new Schema({
    _id: Number,
    name: String,
    description: String,
    appPage: String
  });

  return mongoose.model('role', roleSchema);
};
