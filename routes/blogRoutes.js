const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const {clearHash} = require('../services/cache.js');  //importing function 'clearHash' from cache.js
const middleCleanCache = require('../middlewares/middleCleanCache.js')

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    /*
    // Original LOC where cache logic was defined here
    const redis = require('redis');
    const redisUrl = 'redis://127.0.0.1:6379';
    const client = redis.createClient(redisUrl);
    const util = require('util');
    client.get = util.promisify(client.get);
    //here we are referencing that whenever client.get is executed, it will always wrap up in promise

    //Do we have to any cache related data in redis
    const cacheBlogs = await client.get(req.user.id); //here the whole query is referencing as key in redis

    //If yes, respond to the query right away, and no need to goto MongoDB
    if(cacheBlogs) {
      console.log('Serving from cache server')
      return res.send(JSON.parse(cacheBlogs));
    }

    //If no, respond to the reqest & update the cache

    const blogs = await Blog.find({ _user: req.user.id });
    console.log('Serving from MongoDB')
    res.send(blogs);

    client.set(req.user.id, JSON.stringify(blogs));*/

    const blogs = await Blog
      .find({_user: req.user.id})
      .cache({key: req.user.id});

    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin, middleCleanCache, async (req, res) => {
    const { title, content, imageUrl } = req.body;

    const blog = new Blog({
      imageUrl,
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }

    //clearHash(req.user.id); //passing id(key of redis) of user whose value to be deleted
  });
};
