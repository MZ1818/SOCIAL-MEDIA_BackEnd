const router = require("express").Router();
const postController = require("../controllers/postController");
const requireUser = require("../middlewares/requireUser");

// router.get("/all", requireUser, postController.getAllPostController);
router.post("/", requireUser, postController.createPostController);
router.post("/like", requireUser, postController.likeAndUnlikePost);
router.put("/", requireUser, postController.updatePostController);
router.delete("/", requireUser, postController.deletePostController);

module.exports = router;
