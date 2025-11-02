import {Router} from 'express'
import {loginUser, 
    logoutUser, 
    registerUser,
    refreshAccessToken, 
    changeCurrentPassword,
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory } 
from '../controllers/user.controller.js'

import  {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'


const router= Router()

//middleware is jaate hue mujhse milke jaana 
//so registerUser se pehele ham middleware laga denge
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT, logoutUser)  //verifyJWT is the middleware
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT,changeCurrentPassword)
router.route('/current-user').post(verifyJWT,getCurrentUser)
router.route('/update-account').patch(verifyJWT,updateAccountDetails)
router.route('/avatar').patch(verifyJWT,upload.single('avatar'),updateUserAvatar)
router.route('/cover-image').patch(verifyJWT,upload.single('coverImage'),updateUserCoverImage)
router.route('/c/:username').get(verifyJWT,getUserChannelProfile)
//when we get data from params we do this
router.route('/history').get(verifyJWT,getWatchHistory)


export default router