module.exports = (mongoose, Schema) => {
  let errorSchema = new Schema(
    {
      time: Date,
      method: String,
      url: String,
      statusCode: Number,
      statusMessage: String,
      login: String,
      text: String,
      body: Object
    },
    { toJSON: { virtuals: true } }
  );

  return mongoose.model('error', errorSchema);
};
