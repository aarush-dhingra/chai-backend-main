import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
    getAllTweets  // ← Import it
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"


const router = Router();


router.route("/").get(getAllTweets);  // ← Add this line BEFORE the POST

router.route("/").post(verifyJWT, createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(verifyJWT, updateTweet).delete(verifyJWT, deleteTweet);

export default router
