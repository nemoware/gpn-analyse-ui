module.exports = (mongoose, Schema) => {
  let catalogSchema = new Schema(
    {
      affiliatesListQuarter: Number,
      last_csgk_sync_date: Date
    },
    { collection: 'catalog' }
  );

  return mongoose.model('Catalog', catalogSchema);
};
