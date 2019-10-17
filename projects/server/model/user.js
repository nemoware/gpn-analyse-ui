module.exports = (mongoose, Schema) => {
  let userSchema = new Schema({
    login: String,
    roles: [{ _id: Number, name: String, description: String, appPage: String }]
  });

  return mongoose.model('user', userSchema);
};
