module.exports = (mongoose, Schema) => {
  let auditStatusSchema = new Schema(
    {
      _id: Number,
      name: String
    },
    { toJSON: { virtuals: true } }
  );

  return mongoose.model('auditStatus', auditStatusSchema);
};
