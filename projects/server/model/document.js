module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let documentSchema = new Schema({
    auditId: ObjectId,
    filename: String,
    parse: Object,
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
    },
    user: {
      attributes: Object,
      author: { _id: ObjectId, login: String },
      updateDate: Date
    }
  });

  return mongoose.model('document', documentSchema);
};
