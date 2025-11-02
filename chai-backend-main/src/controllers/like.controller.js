import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!mongoose.isValidObjectId(videoId)) throw new ApiError(400, "Video not found")

    const user = req.user?._id
    if (!user) throw new ApiError(400, "User needs to log in to like video")

    const likedStatus = await Like.findOne({ video: videoId, likedBy: user });
    if (likedStatus) {
        // Try to delete
        const deletedLike = await Like.findOneAndDelete({
            video: videoId,
            likedBy: user
        });

        if (!deletedLike) {
            throw new ApiError(500, "Failed to unlike the video");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Video unliked successfully"));
    } else {
        // Try to create
        const newLike = await Like.create({ video: videoId, likedBy: user });

        if (!newLike) {
            throw new ApiError(500, "Failed to like the video");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Video liked successfully"));
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const user = req.user?._id;
    if (!user) {
        throw new ApiError(400, "User needs to log in to like/unlike comment");
    }

    const likedStatus = await Like.findOne({ comment: commentId, likedBy: user });

    if (likedStatus) {
        const deletedLike = await Like.findOneAndDelete({
            comment: commentId,
            likedBy: user
        });

        if (!deletedLike) {
            throw new ApiError(500, "Failed to unlike the comment");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Comment unliked successfully"));
    } else {
        const newLike = await Like.create({ comment: commentId, likedBy: user });

        if (!newLike) {
            throw new ApiError(500, "Failed to like the comment");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Comment liked successfully"));
    }
});


const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!mongoose.isValidObjectId(tweetId)) throw new ApiError(400, "Tweet not found")

    const user = req.user?._id
    if (!user) throw new ApiError(400, "User needs to log in to like tweet")

    const likedStatus = await Like.findOne({ tweet: tweetId, likedBy: user });
    if (likedStatus) {
        // Try to delete
        const deletedLike = await Like.findOneAndDelete({
            tweet: tweetId,
            likedBy: user
        });

        if (!deletedLike) {
            throw new ApiError(500, "Failed to unlike the tweet");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Tweet unliked successfully"));
    } else {
        // Try to create
        const newLike = await Like.create({ tweet: tweetId, likedBy: user });

        if (!newLike) {
            throw new ApiError(500, "Failed to like the tweet");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Tweet liked successfully"));
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    // Extract pagination and sorting info
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortType = "desc"
    } = req.query;

    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "Please log in to view liked videos");

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    // Step 1: Find all likes where likedBy = user and video is not null
    const likedVideoRefs = await Like.find({ likedBy: userId, video: { $ne: null } })
        .select("video -_id")
        .lean();

    const videoIds = likedVideoRefs.map(like => like.video);

    // Step 2: Find the actual videos from those IDs
    const videos = await Video.find({ _id: { $in: videoIds }, isPublished: true })
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean();

    // Step 3: Count total liked videos
    const total = await Video.countDocuments({ _id: { $in: videoIds }, isPublished: true });

    // Step 4: Respond
    return res.status(200).json(
        new ApiResponse(200, {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
            videos,
        }, "Liked videos fetched successfully")
    );
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}