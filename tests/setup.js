jest.setTimeout(40000); //set timeout for each tests in seconds

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys.js');

//console.log('Setup.js executed');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {useMongoClient: true});
