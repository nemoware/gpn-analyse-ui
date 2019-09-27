module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let auditSchema = new Schema({
    company: {
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
    ]
  });

  return mongoose.model('Audit', auditSchema);
};
