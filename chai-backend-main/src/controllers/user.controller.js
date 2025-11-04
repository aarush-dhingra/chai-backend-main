import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from '../utils/ApiError.js'
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import removeFromCloudinary from "../utils/cloudinary_remove.js"
import { isValidObjectId } from "mongoose"


const generateAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        //whenever we use "save" the database ki validations (ki required fields hai ki nahi) kick in 
        //so we use validatebeforesave:false

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Error in generating access and refresh token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    //take user details from frontend --postman can be used if no frontend 
    //validation -- not empty
    //check if user is already register (by username/email)
    //check for images,check for avtaar 
    //upload to cloudinary, check for avatar in cloudinary 
    //create user object -- create entry in db
    //remove password and refresh token field from response 
    //check for user creation 
    //return response 

    //we can get json data,data from form etc like req.body and we are destructuring it
    const { fullName, username, email, password } = req.body
    console.log("email: ", email);
    console.log("username", username);

    if (!fullName) throw new ApiError(400, "full name is required")
    if (!username) throw new ApiError(400, "username is required")
    if (!email) throw new ApiError(400, "email is required")
    if (!password) throw new ApiError(400, "password is required")

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })//like double checking if either exists or not

    if (existedUser) throw new ApiError(409, "User with email or username already exist")

    //since we added a middleware in user router multer 
    // adds more fields and gives us the access to req.files

    const avatarLocalPath = req.files?.avatar[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) throw new ApiError(400, "Avatar is required")

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) throw new ApiError(400, "Avatar is required")

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    //yehi syntax hai .select karke ek string mai '-' 
    //laga ke the fields which you dont wanna display

    if (!createdUser) throw new ApiError(500, "Error in creating the user")

    // ✅ ADD THIS SECTION - Generate tokens for new user
    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                {
                    user: createdUser,
                    accessToken,
                    refreshToken
                },
                "User registered successfully"
            )
        )
})




const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and refresh token
    //send these tokens in form of secure cookie

    const { email, username, password } = req.body
    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) throw new ApiError(400, "User doesnt exist ! Signup to login")

    // password checking ke liye we have made a function but that function can be accessed by "user" and not "User"
    //cause "User" is mongoose ka and is used for functions available in mongoose
    //the ones which we have made will be accessed by the instance of that "User" which is "user"

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) throw new ApiError(400, "Incorrect Password")

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //sending cookies
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'  // ✅ ADD THIS for better CORS handling
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})


const logoutUser = asyncHandler(async (req, res) => {
    //cookies clear kardo 
    //refreshToken ko bhi hata do database se

    //ok so the problem is ki how do we get user ka access here, for that we will design our down middleware 
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken:1  //this removes the field from the document 
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
})

//when the access token expires then to create a new access token
//making refresh token endpoint
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) throw new ApiResponse(401, "unauthorized request")

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) throw new ApiError(401, "Invalid refresh token")

        if (incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, "Refresh token is expired")

        const options = {
            httpOnly: true,
            secure: true
        }

        const { newAccessToken, newRefreshToken } = await generateAccessandRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { newAccessToken, newRefreshToken },
                    "access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh token")
    }
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    //pehele req.user se current user ki id lelo 
    //match in db
    //req.body se old password and new password lelo
    //match it in with database
    //if match then update password in db 
    //else error that password doesnt match 

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)
    if (!user) throw new ApiError(401, "Unauthorized access")

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) throw new ApiError(401, "Password doesnt match")

    user.password = newPassword
    await user.save({
        validateBeforeSave: false
    })
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changes Successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current User fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }

    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const oldAvatar=req.user.avatar

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    if(oldAvatar) await removeFromCloudinary(oldAvatar)

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar image updated successfully")
        )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    const oldCoverImage=req.user.coverImage


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on cover image")

    }
    removeFromCloudinary(coverImage.url)

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    if(oldCoverImage)  await removeFromCloudinary(oldCoverImage)

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Cover image updated successfully")
        )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSunscribedTo: {
          $size: "$subscribedTo"
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSunscribedTo: 1,
        avatar: 1,
        coverImage: 1,
        description: 1,
        email: 1,
        _id: 1
      }
    }
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel Doesn't Exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User Channel fetched successfully"));
});


const getWatchHistory = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: "watchHistory",
                select: "title description videoFile thumbnail views owner createdAt",
                populate: {
                    path: "owner",
                    select: "username fullName avatar"
                }
            })
            .lean();

        if (!user) {
            return res.status(404).json(
                new ApiResponse(404, [], "User not found")
            );
        }

        console.log("Watch history:", user.watchHistory);  // DEBUG

        return res.status(200).json(
            new ApiResponse(200, user.watchHistory || [], "Watch history fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching watch history:", error);
        throw new ApiError(500, "Failed to fetch watch history");
    }
});

const addToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $addToSet: { watchHistory: videoId }  // ✅ Simplified - no need to validate
        },
        { new: true }
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Added to watch history")
    );
});




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    addToWatchHistory
}