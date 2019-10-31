module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let linkSchema = new Schema({
    fromId: ObjectId,
    fromName: String,
    toId: ObjectId,
    toName: String
  });

  return mongoose.model('link', linkSchema);
};
