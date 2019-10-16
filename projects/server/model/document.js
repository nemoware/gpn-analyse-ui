module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let documentSchema = new Schema({
    auditId: ObjectId,
    name: String,
    documentDate: Date,
    documentType: String,
    documentNumber: String,
    parentId: ObjectId,
    paragraphs: [{ paragraphHeader: Object, paragraphBody: Object }],
    analysis: {
      original_text: String,
      normal_text: String,
      analyze_timestamp: Date,
      tokenization_maps: {
        words: [[Number, Number]]
      },
      checksum: Number,
      attributes: Object,
      headers: [
        {
          value: String,
          parent: Object,
          span: [Number, Number],
          span_map: String,
          confidence: Number,
          display_value: String
        }
      ]
    }
  });

  return mongoose.model('document', documentSchema);
};
