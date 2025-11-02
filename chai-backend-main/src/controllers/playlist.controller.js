import mongoose from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const user = req.user?._id;

    if (!user) throw new ApiError(400, "Login to create the playlist");
    if (!name?.trim()) {
        throw new ApiError(400, "Playlist name is required");
    }
    if (!description?.trim()) {
        throw new ApiError(400, "Playlist description is required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: user
    });

    if (!playlist) throw new ApiError(400, "Failed to create the playlist");

    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    );
});


const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const playlists = await Playlist.find({ owner: userId })
        .populate("videos")
        .exec();

    return res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});



const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("videos")
        .populate("owner", "username email") // optional
        .exec();

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const user = req.user?._id;
    if (!user) throw new ApiError(400, "User needs to login");

    const playlist = await Playlist.findOne({
        _id: playlistId,
        owner: user
    });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or you're not the owner");
    }

    const video = await Video.findOne({
        _id: videoId,
        isPublished: true
    });

    if (!video) {
        throw new ApiError(404, "Video not found or not published");
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in this playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $push: { videos: videoId } },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully")
    );
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const user = req.user?._id;
    if (!user) throw new ApiError(400, "User needs to login");

    const playlist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: user },
        { $pull: { videos: videoId } },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or you're not the owner");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});


const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const user = req.user?._id;
    if (!user) throw new ApiError(400, "User needs to login");

    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: user
    });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or you're not the owner");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    );
});


const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const user = req.user?._id;
    if (!user) throw new ApiError(400, "User needs to login");

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: user },
        {
            $set: {
                ...(name && { name: name.trim() }),
                ...(description && { description: description.trim() })
            }
        },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found or you're not the owner");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
