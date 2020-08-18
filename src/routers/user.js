const express = require ('express')
const User = require ('../models/user')
//Temos de validar o login em cada route e não no index
const auth = require('../middleware/auth')
const multer = require ('multer')
const sharp = require ('sharp')
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/account')

const router = new express.Router ()

router.post("/users", async (req,res) => {
    const user = new User (req.body)
    try {
        await user.save()
        sendWelcomeEmail (user.email, user.name)
        const token = await user.generateAuthToken ()
        res.status(201).send({user, token})
    }catch (e){
        res.status(400).send(e)
    }
    
    /*user.save().then(()=>{
        res.status(201).send(user)
    }).catch ((error) => {
        res.status(400).send(error)
    })*/
})



router.post ('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials (req.body.email, req.body.password)
        const token = await user.generateAuthToken ()
        res.send ({user, token})
    } catch (e) {
        res.status(400).send()
    }
})

router.post ('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save ()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post ('/users/logoutAll', auth , async (req, res) =>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
    
})

router.get ('/users/me',auth, async (req,res) => {
    res.send (req.user)
    /*try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }*/
    
/*User.find({}).then ((users)=>{
        res.send (users)
    }).catch ((e) => {
        res.status(500).send()
    })*/
})

router.get ('/users/:id', async (req, res) => {
    const _id = req.params.id
    try {
       const user = await User.findById (_id)
       if (!user) return res.status(404).send()
       res.send (user)
    } catch (e) {
        res.status(500).send()
    }
    
    /*User.findById (_id).then ((user)=>{
        if (!user) return res.status(404).send()

        res.send (user)
    }).catch ((e) => {
        res.status(500).send()
    })*/

})

router.patch('/users/me' , auth ,async (req,res) => {
    // Update User by ID
    const updates = Object.keys(req.body)
    const alloweUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update) => alloweUpdates.includes(update))
    //Retorna true se existe e false se não existir

    if (!isValidOperation){
        return res.status(400).send({error: 'Invalid Updates!'})
    }

    try {
        // Tivemos de mudar isto por causa de encriptar a passe se mudar a passe se fizer find a replace numa só linha o bcrypt não vai funcionar
        updates.forEach ((update)=>{
            req.user[update] = req.body[update]
        })

        await req.user.save ()
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        res.send(req.user)
    } catch (e) {
         res.status(400).send(e)
    }
})

router.patch('/users/:id' , async (req,res) => {
    // Update User by ID
    const updates = Object.keys(req.body)
    const alloweUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update) => alloweUpdates.includes(update))
    //Retorna true se existe e false se não existir

    if (!isValidOperation){
        return res.status(400).send({error: 'Invalid Updates!'})
    }

    try {
        // Tivemos de mudar isto por causa de encriptar a passe se mudar a passe se fizer find a replace numa só linha o bcrypt não vai funcionar
        const user = await User.findById (req.params.id)
        updates.forEach ((update)=>{
            user[update] = req.body[update]
        })

        await user.save ()
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        if (!user) return res.status(404).send()

        res.send(user)
    } catch (e) {
         res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        //const user = await User.findByIdAndDelete (req.user._id)
        //if (!user) return res.status(404).send()
        await req.user.remove()
        sendCancelationEmail (req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer ({
    limits: {
        fileSize: 1000000
    },
    fileFilter (req , file, cb){
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error ('Please provide a JPG JPEG ou PNG'))
        }
        cb (undefined, true)
    }
})

router.post ('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // transforma a imagem
    const buffer = await sharp (req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    //req.user.avatar = req.file.buffer
    await req.user.save()
    res.send ()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get ('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar){
            throw new Error()
        }
        res.set ('Content-Type','image/jpg')
        res.send (user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router
