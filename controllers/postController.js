const { succes, error } = require("../utils/responseWrapper");
const Post = require("../models/Post");
const User = require("../models/User");
const { response } = require("express");
const { mapPostOutput } = require("../utils/Utils");
const cloudinary = require("cloudinary").v2;

// const getAllPostController = async (req, res) => {
//   console.log(req._id);
//   // return res.send("These are all the posts");
//   return res.send(succes(200, "These are all the posts"));
// };

const createPostController = async (req, res) => {
  try {
    const { caption, postImg } = req.body;

    if (!caption || !postImg) {
      return res.send(error(400, "Caption and postImg are required"));
    }

    const cloudImg = await cloudinary.uploader.upload(postImg, {
      folder: "postImg",
    });

    const owner = req._id;

    const user = await User.findById(req._id);

    const post = await Post.create({
      owner,
      caption,
      image: {
        publicId: cloudImg.public_id,
        url: cloudImg.url,
      },
    });

    user.posts.push(post._id);
    await user.save();

    return res.send(succes(200, { post }));
  } catch (e) {
    res.send(error(500, e.message));
  }
};

const likeAndUnlikePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const curUserId = req._id;

    const post = await Post.findById(postId).populate("owner");

    if (!post) {
      return res.send(error(404, "Post not found"));
    }

    if (post.likes.includes(curUserId)) {
      const index = post.likes.indexOf(curUserId);
      post.likes.splice(index, 1);

      // await post.save();
      // return res.send(succes(200, "Post Unliked"));
    } else {
      post.likes.push(curUserId);
      // await post.save();
      // return res.send(succes(200, "Post liked"));
    }
    await post.save();
    return res.send(succes(200, { post: mapPostOutput(post, req._id) }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//when owners want to update their post
const updatePostController = async (req, res) => {
  try {
    const { postId, caption } = req.body;
    const curUserId = req._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.send(error(404, "Post not found"));
    }
    if (post.owner.toString() !== curUserId) {
      return res.send(error(403, "Only Owner can update their posts"));
    }
    if (caption) {
      post.caption = caption;
    }
    await post.save();
    return res.send(succes(200, post));
  } catch (e) {
    res.send.send(error(500, e.message));
  }
};

// delete post
const deletePostController = async (req, res) => {
  try {
    const { postId } = req.body;
    const curUserId = req._id;

    const post = await Post.findById(postId);
    const curUser = await User.findById(curUserId);
    if (!post) {
      return res.send(error(404, "Post not found"));
    }
    if (post.owner.toString() !== curUserId) {
      return res.send(error(403, "Only Owner can update their posts"));
    }

    //post is also in users model section which is also needed to be deleted
    const index = curUser.posts.indexOf(postId);
    curUser.posts.splice(index, 1);
    await curUser.save();
    await post.deleteOne();

    return res.send(succes(200, "Post deleted"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  // getAllPostController,
  createPostController,
  likeAndUnlikePost,
  updatePostController,
  deletePostController,
};
