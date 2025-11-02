import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {

    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortType = "desc"
    } = req.query;

    const { videoId } = req.params;

    // Validate videoId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Filter for this video's comments
    const filter = {
        video: videoId,
    };

    // Sorting options
    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    // Pagination calculation
    const skip = (Number(page) - 1) * Number(limit);

    // Fetch comments
    const comments = await Comment.find(filter)
        .populate("owner", "username avatar") // populate user info
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean();

    // Count total comments
    const total = await Comment.countDocuments(filter);

    // Respond
    return res.status(200).json(
        new ApiResponse(200, {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
            comments,
        }, "Comments fetched successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    if (!req.user._id) throw new ApiError(400, "Login to comment")
    const owner = req.user?._id
    const { content } = req.body
    if (!content) throw new ApiError(400, "Comment is empty")
    const comment = await Comment.create({
        content,
        video: videoId,
        owner
    })
    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment created successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const owner = req.user?._id;
    if (!owner) throw new ApiError(400, "User not found");

    const { commentId } = req.params;
    if (!commentId) throw new ApiError(400, "Comment not found");

    const { content: newContent } = req.body;
    if (!newContent) throw new ApiError(400, "Comment content is empty");

    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: owner },    // Filter by _id instead of comment
        { $set: { content: newContent } },
        { new: true }
    );


    if (!updatedComment) {
        throw new ApiError(404, "Comment not found or you are not the owner");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    const owner = req.user?._id;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    if (!owner) {
        throw new ApiError(401, "Please log in to delete comments");
    }

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: owner
    });

    if (!comment) {
        throw new ApiError(404, "Comment not found or you're not the owner");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment deleted successfully"));
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
