const adAuth = require('../authorization/adAuthorization');

module.exports = (mongoose, Schema) => {
  let userSchema = new Schema(
    {
      login: String,
      roles: [
        { _id: Number, name: String, description: String, appPage: String }
      ]
    },
    { toJSON: { virtuals: true } }
  );

  /*userSchema.virtual('name').get(async function() {
    return await adAuth.getUserName(this.login);
  });*/

  return mongoose.model('user', userSchema);
};
