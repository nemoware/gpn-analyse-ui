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
      statuses: [
        { date: Date, status: { _id: ObjectId, name: String }, comment: String }
      ],
      comments: [
        {
          date: Date,
          text: String,
          author: { _id: ObjectId, login: String, name: String }
        }
      ],
      createDate: Date,
      author: { _id: ObjectId, login: String, name: String }
    },
    { toJSON: { virtuals: true } }
  );
  auditSchema.virtual('subsidiaryName').get(function() {
    return this.subsidiary.name;
  });
  return mongoose.model('Audit', auditSchema);
};
