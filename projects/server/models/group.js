module.exports = (mongoose, Schema) => {
  let groupSchema = new Schema({
    cn: String,
    distinguishedName: String,
    target: {
      type: String,
      enum: ['admin', 'audit', 'event']
    },
    roles: [{ _id: Number, name: String, description: String, appPage: String }]
  });

  return mongoose.model('Group', groupSchema);
};
