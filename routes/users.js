const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// ➕ Follow a user
router.put('/:id/follow', auth, async (req, res) => {
  if (req.user.id === req.params.id)
    return res.status(400).json("You can't follow yourself");

  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow.followers.includes(req.user.id)) {
      userToFollow.followers.push(req.user.id);
      currentUser.following.push(req.params.id);
      await userToFollow.save();
      await currentUser.save();
      res.json("User followed");
    } else {
      res.status(400).json("Already following this user");
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ➖ Unfollow a user
router.put('/:id/unfollow', auth, async (req, res) => {
  if (req.user.id === req.params.id)
    return res.status(400).json("You can't unfollow yourself");

  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (userToUnfollow.followers.includes(req.user.id)) {
      userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user.id);
      currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
      await userToUnfollow.save();
      await currentUser.save();
      res.json("User unfollowed");
    } else {
      res.status(400).json("You are not following this user");
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
