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

  userSchema.virtual('name').get(() => null);
  userSchema.virtual('roleString').get(function() {
    let roles = [];
    for (let role of this.roles) {
      roles.push(role.name);
    }
    return roles.join(', ');
  });

  return mongoose.model('user', userSchema);
};
