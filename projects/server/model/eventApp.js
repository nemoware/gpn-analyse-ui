module.exports = (mongoose, Schema) => {
  const ObjectId = Schema.Types.ObjectId;
  let eventApp = new Schema({
    login: String,
    eventType: {
      _id: ObjectId,
      name: String
    },
    date: Date
  });

  return mongoose.model('eventApp', eventApp);
};
