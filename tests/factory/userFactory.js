const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
  return new User({}).save();
  //we are declaring an empty data within User Model, as we are not using data inside User Model anywhere in application
  //(except for _id that automatically declared by MongoDB)
};
