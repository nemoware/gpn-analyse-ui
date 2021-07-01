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
    hasInside: Boolean,
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
      attributes_tree: Object,
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
      updateDate: Date,
      attributes_tree: Object
    },
    documentType: String
  });

  documentSchema.index(
    //Дата
    {
      'analysis.attributes_tree.contract.date.value': 1,
      'user.attributes_tree.contract.date.value': 1
    }
  );
  documentSchema.index(
    // Номер
    {
      'analysis.attributes_tree.contract.number.value': 1,
      'user.attributes_tree.contract.number.value': 1
    }
  );
  documentSchema.index({
    // Сторона 1
    'analysis.attributes_tree.contract.orgs.0.name.value': 1,
    'user.attributes_tree.contract.orgs.0.name.value': 1
  });
  documentSchema.index({
    // Строна 2
    'analysis.attributes_tree.contract.orgs.name.value': 1,
    'user.attributes_tree.contract.orgs.name.value': 1
  });
  documentSchema.index({
    //
    'analysis.attributes_tree.contract.subject.value': 1,
    'user.attributes_tree.contract.subject.value': 1
  });
  documentSchema.index({
    'analysis.attributes_tree.contract.price.amount_netto.value': 1,
    'user.attributes_tree.contract.price.amount_netto.value': 1
  });
  documentSchema.index({
    'analysis.attributes_tree.contract.price.amount_brutto.value': 1,
    'user.attributes_tree.contract.price.amount_brutto.value': 1
  });

  //Протоколы
  documentSchema.index(
    //Дата
    {
      'analysis.attributes_tree.protocol.date.value': 1,
      'user.attributes_tree.protocol.date.value': 1
    }
  );
  documentSchema.index({
    'analysis.attributes_tree.protocol.org.name.value': 1,
    'user.attributes_tree.protocol.org.name.value': 1
  });
  documentSchema.index({
    'analysis.attributes_tree.protocol.structural_level.value': 1,
    'user.attributes_tree.protocol.structural_level.value': 1
  });

  //УСТАВЫ
  documentSchema.index(
    //Дата
    {
      'analysis.attributes_tree.charter.date.value': 1,
      'user.attributes_tree.charter.date.value': 1
    }
  );
  documentSchema.index({
    'analysis.attributes_tree.charter.org.name.value': 1,
    'user.attributes_tree.charter.org.name.value': 1
  });

  documentSchema.index({
    // Состояние
    state: 1
  });
  documentSchema.index({
    // Предупреждения
    'analysis.warnings': 1,
    'user.warnings': 1
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

  documentSchema.methods.getCharterSubsidiary = function() {
    if (!this.analysis || !this.analysis.attributes_tree) return;

    if (this.user && this.user.attributes_tree) {
      return this.user.attributes_tree.charter?.org?.name?.value;
    } else return this.analysis.attributes_tree.charter?.org?.name?.value;
  };

  documentSchema.methods.getAttributeTreeValue = function(attribute) {
    const documentType = this.documentType.toLowerCase();
    if (!this.analysis || !this.analysis.attributes_tree) return;
    if (this.user && this.user.attributes_tree) {
      return this.user.attributes_tree?.[documentType]?.[attribute]?.value;
    } else
      return this.analysis.attributes_tree?.[documentType]?.[attribute]?.value;
  };

  return mongoose.model('Document', documentSchema);
};
