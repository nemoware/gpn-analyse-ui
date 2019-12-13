module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let userSchema = new Schema({
    login: String,
    roles: [
      { _id: Number, name: String, description: String, appPage: String }
    ],
    stars: [ObjectId]
  });

  return mongoose.model('user', userSchema);
};
