const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Create Post
router.post('/', auth, async (req, res) => {
  try {
    const newPost = new Post({
      userId: req.user.id,
      content: req.body.content,
      image: req.body.image || '',
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Posts (feed)
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().populate('userId', 'username').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Posts by User
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId.toString() !== req.user.id)
      return res.status(403).json("Unauthorized");
    await post.remove();
    res.json("Post deleted");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like / Unlike
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      await post.save();
      res.json("Liked post");
    } else {
      post.likes = post.likes.filter(uid => uid.toString() !== req.user.id);
      await post.save();
      res.json("Unliked post");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({
      userId: req.user.id,
      comment: req.body.comment,
    });
    await post.save();
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;