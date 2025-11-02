import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "User not logged in");

    // Total Videos
    const totalVideos = await Video.countDocuments({ owner: userId });

    // Total Views (sum of views across all videos by user)
    const totalViewsAgg = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const totalViews = totalViewsAgg[0]?.totalViews || 0;

    // Total Subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    // Total Likes (across all videos by user)
    const userVideoIds = await Video.find({ owner: userId }).select("_id").lean();
    const videoIds = userVideoIds.map(v => v._id);
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

    return res.status(200).json(new ApiResponse(200, {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes,
    }, "Channel statistics fetched successfully"));
});


const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortType = "desc"
    } = req.query;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const filter = { owner: channelId, isPublished: true };
    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
    const skip = (Number(page) - 1) * Number(limit);

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean();

    const total = await Video.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
            videos
        }, "Channel videos fetched successfully")
    );
});


export {
    getChannelStats, 
    getChannelVideos
}