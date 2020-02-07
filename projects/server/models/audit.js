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
      status: String,
      createDate: Date,
      violations: [Object],
      author: Object,
      links: [
        {
          fromId: ObjectId,
          toId: ObjectId
        }
      ]
    },
    { toJSON: { virtuals: true } }
  );

  auditSchema.virtual('subsidiaryName').get(function() {
    return this.subsidiary.name;
  });

  return mongoose.model('Audit', auditSchema);
};