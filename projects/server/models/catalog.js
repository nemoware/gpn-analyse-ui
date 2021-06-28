module.exports = (mongoose, Schema) => {
  let catalogSchema = new Schema(
    {
      affiliatesListQuarter: Number
    },
    { collection: 'catalog' }
  );

  return mongoose.model('Catalog', catalogSchema);
};
