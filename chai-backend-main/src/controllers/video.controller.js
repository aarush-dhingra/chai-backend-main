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
        sortBy = "createdAt", // default sort by created date
        sortType = "desc",
        userId,
    } = req.query;

    //filter object
    const filter = {
        isPublished: true, // only get published videos
    };

    if (query) {
        filter.title = { $regex: query, $options: "i" }; // case-insensitive search in title
    }

    if (userId && mongoose.isValidObjectId(userId)) {
        filter.owner = userId; // filter by specific uploader if provided
    }

    //sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    //Calculate skip for pagination
    const skip = (Number(page) - 1) * Number(limit);

    //Fetching videos
    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean(); // lean() to return plain JS objects (faster)

    //Counting total for frontend pagination UI
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

    const { title, description, isPublished } = req.body
    //take local path
    //check if local path exist 
    //usko clodinary pe upload maaro
    //again check maaro
    //the ig database mai update karo

    if (!title?.trim()) {
        throw new ApiError(400, "Title is required");
    }

    if (!description?.trim()) {
        throw new ApiError(400, "Description is required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    if (!videoLocalPath) throw new ApiError(400, "Video File not found")
    const videoCloudinary = await uploadOnCloudinary(videoLocalPath)
    if (!videoCloudinary) throw new ApiError(400, "Error in uploading video to cloudinary")


    const videoDuration = videoCloudinary.duration  //gives results in seconds
    //todo:give proper time like hrs and mins

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (!thumbnailLocalPath) throw new ApiError(400, "File not found")
    const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnailCloudinary) throw new ApiError(400, "Error in thumbnail to uploading to cloudinary")

    const video = await Video.create({
        videoFile: videoCloudinary.url,
        thumbnail: thumbnailCloudinary.url,
        title,
        description,
        isPublished,
        duration: videoDuration,
        owner: req.user?._id
    })

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!mongoose.isValidObjectId(videoId))
        throw new ApiError(400, "invalid video id")

    const video = await Video.findById(videoId).lean()
    if (!video) throw new ApiError(404, "Video not found")

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    //take video id from params
    //take new details
    //check if the current logged in user is the owner of the vid 
    // if yes change the thigs
    //else tell them that they arent authorized to change
    const { videoId } = req.params
    const currentUser = req.user?._id
    if (!currentUser) throw new ApiError(400, "user needs to login")
    if (!mongoose.isValidObjectId(videoId)) throw new ApiError(400, "invalid video id")

    const { title: newTitle, description: newDescription } = req.body
    const newThumbnailLocalPath = req.file?.path;
    console.log("newThumbnailLocalPath:",newThumbnailLocalPath)
    if (!newTitle?.trim() && !newDescription?.trim() && !newThumbnailLocalPath)
        throw new ApiError("400", "Nothing is getting updated")

    const newThumnail = await uploadOnCloudinary(newThumbnailLocalPath)
    if (!newThumnail) throw new ApiError(400, "Error while uploading")

    const updatedVideo = await Video.findByIdAndUpdate(
        {
            _id: videoId,
            owner: currentUser
        },
        {
            $set: {
                title: newTitle,
                description: newDescription,
                thumbnail: newThumnail.url
            }
        }, { new: true })

    if (!updatedVideo) throw new ApiError(404, "Video not found OR you are not authorized to update it")

    return res
        .status(200)
        .json(new ApiResponse(200, updateVideo, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    //take video id
    //check if the video exists 
    //if yes the take its url
    //check if the user is the owner
    //call remove from cloudinary function 

    const { videoId } = req.params
    if (!mongoose.isValidObjectId(videoId)) throw new ApiError(400, "invalid video id")
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(400, "Failed to get video")
    const url = video.videoFile
    if (!url) throw new ApiError(400, "Failed to fetch cloudinary url")
    const userId = req.user._id

    const deletedVideo = await Video.findByIdAndUpdate(
        {
            _id: videoId,
            owner: userId
        },
        {
            $set: {
                videoFile: null,
                isDeleted: true,
            }
        }, { new: true })
    if (!deletedVideo) throw new ApiError(400, "Either the video doesnt exist or you arent the owner of the video")



    const removeVideoFromCloudinary = await removeFromCloudinary(url)
    if (!removeVideoFromCloudinary) throw new ApiError("Failed to remove video from cloudinary")

    return res
        .status(200)
        .json(new ApiResponse(200, deletedVideo, "Video removed successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!mongoose.isValidObjectId(videoId)) throw new ApiError(400, "invalid video id");
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
    );

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