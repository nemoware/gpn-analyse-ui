module.exports = (mongoose, Schema) => {
  let companySchema = new Schema({
    name: String
  });

  return mongoose.model('Company', companySchema);
};
