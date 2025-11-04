import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid Channel Id");
    const user = req.user?._id
    
    if (!user) throw new ApiError(400, "User needs to log in to subscribe")
    console.log('Toggle Subscription:', { channelId, userId: user });

    const subscribeStatus = await Subscription.findOne({ channel: channelId, subscriber: user });
    if (subscribeStatus) {
        const deletesubscription = await Subscription.findOneAndDelete({
            channel: channelId,
            subscriber: user
        });

        if (!deletesubscription) {
            throw new ApiError(500, "Failed to unsubscribe the channel");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Channel unsubscribed successfully"));
    }
    else {
        const newsubscriber = await Subscription.create({ channel: channelId, subscriber: user });

        if (!newsubscriber) {
            throw new ApiError(500, "Failed to subscribe to the channel");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Channel subscribed successfully"));
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortType = "desc"
    } = req.query;

    // Validate channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel Id");
    }

    // Check if channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    // Pagination calculation
    const skip = (Number(page) - 1) * Number(limit);

    // Get subscribers with user details
    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username fullName avatar") // Get subscriber details
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean();

    // Count total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    return res.status(200).json(
        new ApiResponse(200, {
            page: Number(page),
            limit: Number(limit),
            total: totalSubscribers,
            totalPages: Math.ceil(totalSubscribers / limit),
            subscribers: subscribers.map(sub => sub.subscriber), // Return clean subscriber data
        }, "Channel subscribers fetched successfully")
    );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortType = "desc"
    } = req.query;

    // Validate subscriberId
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber Id");
    }

    // Check if user exists
    const user = await User.findById(subscriberId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    // Pagination calculation
    const skip = (Number(page) - 1) * Number(limit);

    // Get subscribed channels with channel details
    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "username fullName avatar coverImage") // Get channel details
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean();

    // Count total subscribed channels
    const totalSubscriptions = await Subscription.countDocuments({ subscriber: subscriberId });

    return res.status(200).json(
        new ApiResponse(200, {
            page: Number(page),
            limit: Number(limit),
            total: totalSubscriptions,
            totalPages: Math.ceil(totalSubscriptions / limit),
            channels: subscriptions.map(sub => sub.channel), // Return clean channel data
        }, "Subscribed channels fetched successfully")
    );
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
