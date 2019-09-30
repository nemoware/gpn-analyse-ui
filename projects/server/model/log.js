module.exports = (mongoose, Schema) => {
  let logSchema = new Schema(
    {
      time: Date,
      method: String,
      url: String,
      login: String
    },
    { toJSON: { virtuals: true } }
  );

  return mongoose.model('Log', logSchema);
};
