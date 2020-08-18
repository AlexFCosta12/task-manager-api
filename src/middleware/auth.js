const jwt = require ('jsonwebtoken')
const User = require ('../models/user')

const auth = async (req ,res, next) => {
    try {
        const token = req.header('Authorization').replace ('Bearer ','')
        const decoded = jwt.verify (token, process.env.JWT_SECRET) 
        //Veirifca a que user pretence o ID e se tem um token valido
        const user = await User.findOne ({_id: decoded._id, 'tokens.token': token })
        
        if (!user){
            throw new Error ()
        }
        req.token = token
        // Retorna o user todo como está na DB
        req.user = user
        next()
    } catch (e) {
        //console.log (e)
        res.status(401).send ({ error: 'Please Authenticate.'})
    }
}

module.exports = auth