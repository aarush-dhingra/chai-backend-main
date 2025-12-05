import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.route("/").get(getAllVideos);
router.route("/:videoId").get(getVideoById);

router.route("/publish").post(
    verifyJWT,  
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishVideo
);

router
    .route("/:videoId")
    .delete(verifyJWT, deleteVideo) 
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo); 

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default router;
