module.exports = (mongoose, Schema) => {
  let groupSchema = new Schema({
    distinguishedName: String,
    cn: String,
    roles: [{ _id: Number, name: String, description: String, appPage: String }]
  });

  return mongoose.model('Group', groupSchema);
};
