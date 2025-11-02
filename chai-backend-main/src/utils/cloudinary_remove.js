import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from '../utils/ApiError.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//cloudinary url is like https://res.cloudinary.com/demo/image/upload/v1710000000/my-folder/avatar_662f89c2.jpg
//so we need to extract "my-folder/avatar_662f89c2" on this part

const removeFromCloudinary = async (url) => {
    try {
        if(!url) throw new ApiError(400,"Give the url")
        // Remove everything up to /upload/
        const parts = url.split("/upload/")[1];
        if (!parts) throw new ApiError(400, "Invalid Cloudinary URL");

        // Remove file extension
        const withoutExtension = parts.split(".")[0];

        await cloudinary.uploader.destroy(withoutExtension)
    } catch(error){
        throw new ApiError(500,"Deletion failed")
    }
    
}

export default removeFromCloudinary;