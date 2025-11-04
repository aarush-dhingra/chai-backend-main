import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    //take content 
    //validate it 
    //check if user is loggedin 
    //make entry in db

    if (!req.user._id) throw new ApiError(400, "Login to post and see tweets")
    const owner = req.user?._id
    const { content } = req.body
    if (!content) throw new ApiError(400, "Tweet is empty")
    const tweet = await Tweet.create({
        content,
        owner
    })
    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const user = req.user?._id;
    if (!user) {
        throw new ApiError(400, "User not found");
    }
    const tweets = await Tweet.find({ owner: user })
        .populate({
            path: "owner",
            select: "username fullName avatar _id"
        })
        .sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
})


const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const owner = req.user?._id
    if (!owner) throw new ApiError(400, "Login First")
    const { content: newContent } = req.body
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id")
    if (!newContent) throw new ApiError(400, "Enter the updated tweet")
    const tweet = await Tweet.findByIdAndUpdate(
        { _id: tweetId, owner: owner },
        {
            $set: { content: newContent }
        },
        { new: true }
    )
    if (!tweet) throw new ApiError(400, "Either tweet doesnt exist or the user isnt the owner")
    return res.status(200)
        .json(new ApiResponse(200, tweet, "Tweet Updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    const owner = req.user._id
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Tweet id isnt valid")
    if (!owner) throw new ApiError(400, "Please login first")
    const tweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: owner
    });
    if (!tweet) {
        throw new ApiError(404, "Tweet not found or you are not the owner");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet deleted successfully"));
})
const getAllTweets = asyncHandler(async (req, res) => {
    const tweets = await Tweet.find()
        .populate({
            path: "owner",
            select: "username fullName avatar _id"  // ✅ Added _id explicitly
        })
        .sort({ createdAt: -1 });
        // ✅ REMOVED .lean() - it can cause populate issues

    console.log("Tweet owner data:", tweets[0]?.owner);  // DEBUG

    return res.status(200).json(
        new ApiResponse(200, tweets, "All tweets fetched successfully")
    );
});



export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets
}