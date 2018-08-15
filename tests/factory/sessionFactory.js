const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys.js');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {  //'user' is an mongoose model
    const sessionObject = {
    passport: {
      user: user._id.toString() //inside an model, the _id consists of JavaScript Object that contain actual _id
    }
  };

  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
  const sig = keygrip.sign('session=' + session);

  //console.log('sessionObject = ', sessionObject);
  //console.log('sessionString = ', sessionString);
  ///console.log('keys = ', keys);
  //console.log('keygrip = ', keygrip);
  //console.log('cookieSignature = ', sessionSignature);

  return {session, sig};
};
