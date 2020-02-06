module.exports = (mongoose, Schema) => {
  let eventTypeSchema = new Schema({
    name: String
  });

  return mongoose.model('EventType', eventTypeSchema);
};
