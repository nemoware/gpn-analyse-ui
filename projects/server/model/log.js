module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let logSchema = new Schema({
    time: Date,
    eventType: { _id: ObjectId, name: String },
    login: String
  });

  return mongoose.model('log', logSchema);
};
