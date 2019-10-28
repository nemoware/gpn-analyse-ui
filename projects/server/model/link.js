module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let linkSchema = new Schema({
    from: ObjectId,
    to: ObjectId
  });

  return mongoose.model('link', linkSchema);
};
