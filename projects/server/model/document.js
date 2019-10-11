module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let documentSchema = new Schema({
    auditId: ObjectId,
    name: String,
    documentDate: Date,
    documentType: String,
    documentNumber: String,
    parse: {
      paragraphs: [{ paragraphHeader: Object, paragraphBody: Object }]
    },
    analysis: {
      original_text: String,
      normal_text: String,
      import_timestamp: Date,
      analyze_timestamp: Date,
      tokenization_maps: {
        words: [[Number, Number]]
      },
      checksum: Number,
      attributes: Object
    }
  });

  return mongoose.model('document', documentSchema);
};
