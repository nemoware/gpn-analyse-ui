module.exports = (mongoose, Schema) => {
  let subsidiarySchema = new Schema(
    {
      name: String
    },
    { toJSON: { virtuals: true } }
  );

  return mongoose.model('Subsidiary', subsidiarySchema);
};
