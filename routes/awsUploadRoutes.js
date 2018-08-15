const aws = require('aws-sdk');
const keys = require('../config/keys.js');
const uuid = require('uuid/v1');
const requireLogin = require('../middlewares/requireLogin.js')

const s3 = new aws.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
  endpoint: 's3-ap-south-1.amazonaws.com',
  signatureVersion: 'v4',
  region: 'ap-south-1'
});

module.exports = app => {
  app.get('/api/upload', requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpeg`;

    s3.getSignedUrl(
      'putObject',
      {
        Bucket: 'darhk-node-testing',
        ContentType: 'image/jpeg',
        Key: key
      },
      (err, url) => res.send({key, url})
    );
  });
};
