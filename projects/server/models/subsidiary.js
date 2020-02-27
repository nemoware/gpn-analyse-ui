module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let subsidiarySchema = new Schema(
    {
      _id: {
        type: String,
        alias: 'name'
      },
      legal_entity_type: String,
      aliases: [String]
    },
    { toJSON: { virtuals: true } }
  );

  return mongoose.model('Subsidiary', subsidiarySchema);
};
