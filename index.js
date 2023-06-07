const express = require('express')
const mongoose  = require('mongoose')
const session = require('express-session')
const keys = require('./keys')

const UserSchema = require('./models/user')

// const cors = require('cors')
// const corsOptions = {
//     credentials: true,
//     origin: true
// }

const app = express();
app.use(express.json())

app.use(session({
    name: "quid",
    secret: keys.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24},
}))

mongoose.set('strictQuery', false)
mongoose.connect(keys.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))

app.get('/', function(req, res, next) {
    console.log(req.session.user)
    if (req.session.user) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.send({"message": "You are not authenticated!"})
    }
})

app.post('/auth/register', async(req, res) => {
    const {name, username, password, repeat} = req.body;

    const user = new UserSchema({
        name, username, password
    })
    await user.save().then((result) => {
        res.status(200, {'Content-Type': 'application/json'})
        .end(JSON.stringify(result))
    })
})


app.post('/auth/login', async(req, res) => {
    console.log('login')
    const {username, password} = req.body
    const user = await UserSchema.findOne({username})
    if(!user) {
        return res.status(400)
        .json({errors: [{value:username,msg:"User not found.",param:"username",location:"body"}]})
    }

    const passwordMatch = password == user.password;
    if(passwordMatch) {
        req.session.user = user;
        console.log(req.session)
        req.session.save(err => {
            if (err) {throw err}
        })
    }
    else {
        console.log("сука")
    }

    res.writeHead(200, {'Content-Type': 'application/json'})
        .end(JSON.stringify(user))
})




app.listen(3000, () => console.log('App is running on port 3000'))