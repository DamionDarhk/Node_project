const mongoose = require('mongoose');
const redis = require('redis');
//const redisUrl = 'redis://127.0.0.1:6379'
const util = require('util');
const keys = require('../config/keys.js')

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);
//in above LOC we are referencing that whenever client.get is executed, it will always wrap up in promise

const exec = mongoose.Query.prototype.exec;
/*here we are referencing to function(Query.prototype.exec : executes any query related to MongoDB) inside mongoose library source code
so that we can modify it*/

mongoose.Query.prototype.cache = function(options = {}) {
  this._isCache = true; //this: query instance of the mongoose query that's being executed
  console.log('cache status and collection name 1:', this._isCache, this.mongooseCollection.name);
  this._hashKey = JSON.stringify(options.key || '');
  return this;
}

mongoose.Query.prototype.exec = async function() {
  if(!this._isCache) {
    console.log('cache status and collection name 2:', this._isCache, this.mongooseCollection.name);
    return exec.apply(this, arguments);
  }


  //console.log('Running an Query');
  //console.log('Query being executed: ', this.getQuery());
  //above LOC states the customized query that's actually being asked to executed by mongoose Ex: { _id: 5b3ef47f9ce3ad040a283e04 }

  //console.log('Collection where query is executed: ', this.mongooseCollection.name);
  //above LOC states the name of MongoDB Collection in which query is being executed

  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }));
  //Object.assign() will copy properties from one Object to another
  //console.log('Unique Key of Redis:', key)

  //1. Check if 'key' exists in Redis
  const cacheValue = await client.hget(this._hashKey, key);

  //2. If so, respond to the query right away, and no need to goto MongoDB
  if(cacheValue) {
    //console.log(this);

    const mongoform = JSON.parse(cacheValue);

    return Array.isArray(mongoform)
      ? mongoform.map(mon => new this.model(mon)) //if cacheValue is an Array of records(objects)
      : this.model(mongoform);  //if cacheValue is an single Object

    /*in above LOC, for some cases cacheValue will have an array of objects
    Ex: [{title: 'MongoDB', collection: 'dark'}, {title: 'Node.js', collection: 'testness'}], and return type always need to be an objects
    so we are using mongoform.map(), that will return each records(in object form) inside cacheValue at a time */
    //model: reference to model class that is tied to query that we are executing
    //this.model: reference to the model that represents the query that is being executed
  }

  //3. If no, respond to the reqest & update the cache

  const moutput = await exec.apply(this, arguments);
  client.hset(this._hashKey, key, JSON.stringify(moutput), 'EX', 10);
  //above LOC moutput is of mongoose document, and since redis accepts only in strings & number so we are changing it
  return moutput;

  //here 'this' refer to Query.prototype.exec function code logic, and 'arguments' refer as any arguments that's passed to this function
}

module.exports = {
  clearHash(_hashKey) {
    client.del(JSON.stringify(_hashKey)); //logic for deleting data for user
  }
};
