import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/subscribed-channels/:subscriberId").get(getSubscribedChannels);

router.route("/channel-subscribers/:channelId").get(getUserChannelSubscribers);

router.route("/toggle/:channelId").post(toggleSubscription);


export default router
