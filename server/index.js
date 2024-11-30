const express = require("express")
const cors = require("cors")
const  mongoose = require("mongoose");
const userRoute = require("./routes/userRoute")
const chatRoute = require("./routes/chatRoute")
const messageRoute = require("./routes/messageRoute") 
const dotenv = require("dotenv");
dotenv.config({ path: './.env' });

const app = express()

app.use(express.json())

app.use(cors())
app.use("/api/users", userRoute)
app.use("/api/chats", chatRoute)
app.use("/api/messages", messageRoute)

const port = process.env.PORT|| 5000
const uri = process.env.DATABASE
//require("dotenv").env



app.listen(port, (req, res)=> {
    console.log(`Server running on port ${port}`)
})

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> console.log("MongoDB connected"))
.catch((error)=> console.log("MongoDB connection failed: ", error.message))


