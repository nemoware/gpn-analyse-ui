module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let auditSchema = new Schema(
    {
      subsidiary: {
        _id: ObjectId,
        name: String
      },
      ftpUrl: String,
      auditStart: Date,
      auditEnd: Date,
      checkedDocumentCount: Number,
      status: { _id: Number, name: String },
      createDate: Date,
      author: { _id: ObjectId, login: String }
    },
    { toJSON: { virtuals: true } }
  );

  auditSchema.virtual('subsidiaryName').get(function() {
    return this.subsidiary.name;
  });

  return mongoose.model('audit', auditSchema);
};
