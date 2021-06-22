module.exports = (mongoose, Schema) => {
  let affiliatesListSchema = new Schema(
    {
      name: String,
      shortName: String,
      reasons: [
        {
          text: String,
          date: Date
        }
      ],
      share: Number,
      company: String
    },
    { collection: 'affiliatesList' }
  );

  return mongoose.model('AffiliatesList', affiliatesListSchema);
};
