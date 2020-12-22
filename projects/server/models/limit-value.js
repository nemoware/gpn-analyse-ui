module.exports = (mongoose, Schema) => {
  let limitValueSchema = new Schema({
    startDate: Date,
    limits: [
      {
        lowerLimit: Number,
        upperLimit: Number,
        limitValue: Number
      }
    ]
  });

  return mongoose.model('LimitValue', limitValueSchema);
};
