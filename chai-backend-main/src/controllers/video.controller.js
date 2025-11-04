import mongoose from 'mongoose'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Video } from '../models/video.model.js'
import removeFromCloudinary from '../utils/cloudinary_remove.js'

const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId,
    } = req.query;

    // Filter object
    const filter = {
        isPublished: true,
    };

    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }

    if (userId && mongoose.isValidObjectId(userId)) {
        filter.owner = userId;
    }

    // Sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    // Calculate skip for pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Fetching videos - ✅ ADD POPULATE
    const videos = await Video.find(filter)
        .populate({
            path: "owner",
            select: "username fullName avatar _id subscribersCount"
        })
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean();

    // Counting total
    const total = await Video.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
            videos,
        }, "Videos fetched successfully")
    );
});

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description, isPublished } = req.body;

    if (!title?.trim()) {
        throw new ApiError(400, "Title is required");
    }

    if (!description?.trim()) {
        throw new ApiError(400, "Description is required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    if (!videoLocalPath) throw new ApiError(400, "Video File not found");
    
    const videoCloudinary = await uploadOnCloudinary(videoLocalPath);
    if (!videoCloudinary) throw new ApiError(400, "Error in uploading video to cloudinary");

    const videoDuration = videoCloudinary.duration;

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail file not found");
    
    const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnailCloudinary) throw new ApiError(400, "Error uploading thumbnail to cloudinary");

    const video = await Video.create({
        videoFile: videoCloudinary.url,
        thumbnail: thumbnailCloudinary.url,
        title,
        description,
        isPublished,
        duration: videoDuration,
        owner: req.user?._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },
        { new: true }
    )
        .populate({
            path: "owner",
            select: "username fullName avatar _id subscribersCount subscribers"
        })
        .lean();

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const userIdStr = userId?.toString();
    const likesArray = Array.isArray(video.likes) 
        ? video.likes.map(id => id.toString()) 
        : [];
    const subscribersArray = Array.isArray(video.owner?.subscribers) 
        ? video.owner.subscribers.map(id => id.toString()) 
        : [];

    const isLiked = userIdStr && likesArray.includes(userIdStr) ? true : false;
    const isSubscribed = userIdStr && subscribersArray.includes(userIdStr) ? true : false;

    const videoWithUserData = {
        ...video,
        isLiked,
        isSubscribed,  // ← MUST BE HERE
    };

    return res
        .status(200)
        .json(new ApiResponse(200, videoWithUserData, "Video fetched successfully"));
});





const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const currentUser = req.user?._id;
    
    if (!currentUser) throw new ApiError(401, "User needs to login");
    if (!mongoose.isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

    const { title: newTitle, description: newDescription } = req.body;
    const newThumbnailLocalPath = req.file?.path;

    // Check if at least something is being updated
    if (!newTitle?.trim() && !newDescription?.trim() && !newThumbnailLocalPath) {
        throw new ApiError(400, "At least one field must be updated");
    }

    // Prepare update object
    const updateData = {};
    
    if (newTitle?.trim()) updateData.title = newTitle;
    if (newDescription?.trim()) updateData.description = newDescription;

    // ✅ FIX: Handle thumbnail only if provided
    if (newThumbnailLocalPath) {
        const newThumbnail = await uploadOnCloudinary(newThumbnailLocalPath);
        if (!newThumbnail) throw new ApiError(500, "Error uploading thumbnail");
        updateData.thumbnail = newThumbnail.url;
    }

    // ✅ FIX: Use correct query and return variable
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateData
        },
        { new: true }
    ).populate({
        path: "owner",
        select: "username fullName avatar _id subscribersCount"
    });

    // Check ownership and existence
    if (!updatedVideo) throw new ApiError(404, "Video not found");
    if (updatedVideo.owner._id.toString() !== currentUser.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    // Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    const url = video.videoFile;
    if (url) {
        await removeFromCloudinary(url);
    }

    // Also remove thumbnail
    if (video.thumbnail) {
        await removeFromCloudinary(video.thumbnail);
    }

    // Hard delete from database
    await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id,
    });

    if (!video) {
        throw new ApiError(404, "Video not found or you are not authorized to modify it");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: { isPublished: !video.isPublished },
        },
        { new: true }
    ).populate({
        path: "owner",
        select: "username fullName avatar _id subscribersCount"
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video publish status toggled"));
});

export {
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos
}
