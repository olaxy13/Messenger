const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken")

const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET_KEY;
    return jwt.sign({_id}, jwtkey, {expiresIn: "3d"})
}


exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
  
  let user = await User.findOne({ email })
  if(user) return res.status(400).json("User Exist")

  if(!name || !email || !password) return res.status(400).json("All fields are required")
  
  if(!validator.isEmail(email)) return res.status(400).json("Email must be a valid email....")
  if(!validator.isStrongPassword(password)) return res.status(400).json("Password must be strong....")

    user = new User({ name, email, password})

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)

    await user.save()

    const token = createToken(user._id)

    res.status(200).json({_id: user._id, name, email, token})
    } catch(err) {
        console.log(err)
        res.status(500).json(err)
    }
  
};

exports.login = async (req, res)=> {
    const { email, password } = req.body;

    try{
        let user = await User.findOne({ email })

        if(!user) return res.status(400).json("Invalid email or password....")
        const isValidPassword = await bcrypt.compare(password, user.password)

        if(!isValidPassword) return res.status(400).json("Invalid email or password......");
        const token = createToken(user._id)

        res.status(200).json({_id: user._id, name:user.name, email, token});
    } catch(err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.getUser = async (req, res) => {
    const userId = req.params.userId
    try {
const user = await User.findById(userId)

res.status(200).json(user);
    }catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.getAllUser = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users)
    } catch(err) {
        console.log(err)
        res.status(500).json(err)
    }
}