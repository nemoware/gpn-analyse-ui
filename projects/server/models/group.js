module.exports = (mongoose, Schema) => {
  let groupSchema = new Schema({
    distinguishedName: String,
    name: String,
    roles: [{ _id: Number, name: String, description: String, appPage: String }]
  });

  return mongoose.model('Group', groupSchema);
};
