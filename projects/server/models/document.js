module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let documentSchema = new Schema({
    auditId: ObjectId,
    filename: String,
    parse: Object,
    parserResponseCode: Number,
    state: Number,
    analysis: {
      version: String,
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
      ],
      warnings: [{ code: String }],
      resolvedWarnings: [{ code: String }]
    },
    user: {
      attributes: Object,
      author: Object,
      updateDate: Date
    }
  });

  return mongoose.model('Document', documentSchema);
};
