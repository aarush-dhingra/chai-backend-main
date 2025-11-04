import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes

// ✅ Change these to match frontend expectations
router.route("/c/:channelId").post(toggleSubscription);  // ← Changed from /toggle/:channelId
router.route("/u/:channelId").get(getUserChannelSubscribers);  // ← Changed from /channel-subscribers/:channelId
router.route("/subscribed-channels/:subscriberId").get(getSubscribedChannels);

export default router
