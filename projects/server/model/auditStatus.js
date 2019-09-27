module.exports = (mongoose, Schema) => {
  let auditStatusSchema = new Schema(
    {
      name: String
    },
    { toJSON: { virtuals: true } }
  );

  return mongoose.model('AuditStatus', auditStatusSchema);
};
