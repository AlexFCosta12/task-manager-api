const mongoose = require ('mongoose')

const connectionURL= process.env.MONGODB_URL

mongoose.connect(connectionURL,{
    useNewUrlParser: true,
    userCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})