const express = require ('express')
//Connexão a base de dados
require ('./db/mongoose')
// Não sei porque a linha de baixo mas acho que posso apagar
const { findByIdAndUpdate } = require('./models/user')
const userRouter = require ('./routers/user')
const taskRouter = require ('./routers/task')

console.log("Entrou")
const app = express ()

//const port = process.env.PORT || 3000
// Depois de ter o ficheiro de configuração
const port = process.env.PORT

// É a função que corre quando vem um pedido do local para o servidor - é aqui que vamos validar o token - Criado uma pasta a parte MiddleWare
/*app.use ((req , res , next) => {
    if (req.method === 'GET') {
        res.send ('GET Requests are desable')
    }else {
        next ()
    }
})*/

/*const multer = require ('multer')
const upload = multer ({
    dest: 'images',
    //limits - limita o tamanho
    limits: {
        //Bytes
        fileSize: 1000000
    },
    fileFilter (req , file, cb) {  
        if (!file.originalname.match(/\.(doc|docx)$/)){
            return cb (new Error('File Must Be a Word Document'))
        }

        //Reject
        //cb (new Error('File Must Be a PDF'))
        //Acept
        cb (undefined, true)

        //cb (undefined, false)
    }
})
app.post('/upload', upload.single('upload') ,(req,res)=> {
    res.send ()
}, (error, req, res, next)=>{ // Precisa exatamente de ter este parametros
    res.status(400).send({ error: error.message })
})*/

app.use (express.json())
app.use (userRouter)
app.use (taskRouter)

app.listen (port,()=>{
    console.log ('Server is up on port '+ port)
})
