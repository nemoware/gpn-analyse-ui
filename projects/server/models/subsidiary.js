module.exports = (mongoose, Schema) => {
  let subsidiarySchema = new Schema(
    {
      _id: {
        type: String,
        alias: 'name'
      },
      legal_entity_type: String,
      aliases: [String],
      subsidiary_id: String
    },
    { toJSON: { virtuals: true } }
  );

  return mongoose.model('Subsidiary', subsidiarySchema);
};
