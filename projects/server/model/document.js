module.exports = (mongoose, Schema) => {
  let documentSchema = new Schema({
    idAudit: String,
    name: String,
    documentDate: Date,
    documentType: String,
    documentNumber: String,
    paragraphs: [{ paragraphHeader: Object, paragraphBody: Object }]
  });

  return mongoose.model('document', documentSchema);
};
