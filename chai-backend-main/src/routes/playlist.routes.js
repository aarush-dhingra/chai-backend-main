import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes

// ✅ SPECIFIC ROUTES FIRST
router.route("/user/:userId").get(getUserPlaylists);
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

// ✅ CREATE ROUTE
router.route("/").post(createPlaylist);

// ✅ GENERIC ROUTES LAST
router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

export default router;
