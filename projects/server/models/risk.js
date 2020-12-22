module.exports = (mongoose, Schema) => {
  let riskSchema = new Schema({
    violation: String,
    subject: String,
    risk: String,
    recommendation: String,
    disadvantage: String
  });

  return mongoose.model('Risk', riskSchema);
};
