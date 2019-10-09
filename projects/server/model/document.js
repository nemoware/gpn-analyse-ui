module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let documentSchema = new Schema({
    auditId: ObjectId,
    name: String,
    documentDate: Date,
    documentType: String,
    documentNumber: String,
    paragraphs: [{ paragraphHeader: Object, paragraphBody: Object }]
  });

  return mongoose.model('document', documentSchema);
};
