module.exports = (mongoose, Schema) => {
  let groupSchema = new Schema({
    name: String,
    roles: [{ _id: Number, name: String, description: String, appPage: String }]
  });

  return mongoose.model('group', groupSchema);
};
