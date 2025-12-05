import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"



const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

//routes declaration

app.use("/user", userRouter)
app.use("/tweet", tweetRouter)
app.use("/subscription", subscriptionRouter)
app.use("/video", videoRouter)
app.use("/comment", commentRouter)
app.use("/like", likeRouter)
app.use("/playlist", playlistRouter)
app.use("/dashboard", dashboardRouter)


// http://localhost:8000/users/register

export { app }