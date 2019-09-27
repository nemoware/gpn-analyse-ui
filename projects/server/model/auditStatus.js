module.exports = (mongoose, Schema) => {
  let auditStatusSchema = new Schema({
    name: String
  });

  return mongoose.model('AuditStatus', auditStatusSchema);
};
