module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let documentSchema = new Schema({
    auditId: ObjectId,
    subsidiary: {
      name: String
    },
    ftpUrl: String,
    createDate: Date,
    filename: String,
    parse: Object,
    parserResponseCode: Number,
    state: Number,
    isActive: Boolean,
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

  documentSchema.methods.getAttributeValue = function getAttributeValue(
    attribute
  ) {
    if (!this.analysis || !this.analysis.attributes) return;

    if (this.user && this.user.attributes) {
      if (this.user.attributes[attribute])
        return this.user.attributes[attribute].value;
    } else if (this.analysis.attributes[attribute]) {
      return this.analysis.attributes[attribute].value;
    }
  };

  return mongoose.model('Document', documentSchema);
};
