const mongoose = require ('mongoose')
const validator = require ('validator')
const bcrypt = require('bcryptjs')
const jwt = require ('jsonwebtoken')
const Task = require('./task')

//isto é tipo uma object em Java
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        require: true,
        trim: true,
        lowercase: true,
        validate (value){
            if (!validator.isEmail(value)){
                throw new Error ('Email Invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate (value){
            if (value<0){
                throw new Error ('Age must be a positive number')
            }
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate (value) {
            //if (value === 'password') throw new Error ('Invalid Password')
            if (value.toLowerCase().includes('password')) throw new Error ('Invalid Password')
        }

    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar :{
        type: Buffer
    }
}, {
    // Serve para adiconar o createAT e UpdateAT
    timestamps: true
})

//Criar um atibuto virtual para ter acesso a todas as tasks que o user criou
userSchema.virtual('tasks', {
    // Faz referencia as Tasks
    ref: 'Task',
    // Campo do user
    localField: '_id',
    // Campo que vai fazer a pesquisa em task, neste cso owner
    foreignField: 'owner'
})

//toJSON -- Corre sempre que é chamado o User neste caso para o User
userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()

    // Retira o que não queres enviar
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

// Estancias individuais usa - se methods - Só pode ser usado já com o objecto
//Tens acesso ao this porque já é enviado o objecto
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign ({ _id: user._id}, process.env.JWT_SECRET, {expiresIn: '7 days'})

    user.tokens = user.tokens.concat ({ token })
    await user.save();

    return token
}
//method - altera
//statics - Valida ou vai buscar valores

// Estancias partilhadas usa - se methods - Pode ser usado mesmo não tendo o objecto usa se com User e não user
//Não tens acesso ao this
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne ({ email })
    if (!user) throw new Error ('Unable to login')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error ('Unable to login')

    return user

}

//Hash the plain text password before saving
//Antes de user ser gravado (pre) e fosse depois era Post
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    // Final da função - Tem de ter sempre este next ()
    next()
})
// Delete user tasks when user is removed
userSchema.pre ('remove', async function (next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next();
})

const User = mongoose.model('User',userSchema)

module.exports = User