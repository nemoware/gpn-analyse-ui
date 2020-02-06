module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let userSchema = new Schema({
    login: String,
    stars: [{ documentId: ObjectId, auditId: ObjectId }]
  });

  return mongoose.model('user', userSchema);
};
