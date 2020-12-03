module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let auditSchema = new Schema(
    {
      subsidiary: {
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
      bookValues: Object,
      links: [
        {
          fromId: ObjectId,
          toId: ObjectId
        }
      ],
      charters: [ObjectId],
      conclusion: {
        intro: String,
        shortSummary: String,
        strengths: String,
        disadvantages: String,
        recommendations: String,
        risks: String,
        corporateStructure1: String,
        legal_entity_type: String
      }
    },
    { toJSON: { virtuals: true } }
  );

  auditSchema.virtual('subsidiaryName').get(function() {
    return this.subsidiary.name;
  });

  return mongoose.model('Audit', auditSchema);
};
