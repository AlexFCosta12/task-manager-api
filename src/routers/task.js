const express = require ('express')
const Task = require ('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router ()


router.post("/tasks", auth ,async (req,res) => {
    //const task = new Task (req.body)
    const task = new Task({
        //... -> Serve para passar todos os campos que são iguais (Como o mesmo nome que na Base de dados)
        ...req.body,
        owner : req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send (e)
    }
    
    /*task.save().then(() => {
        res.status(201).send (task)
    }).catch ((e) => {
        res.status(400).send (e)
    })*/
})

//GET / tasks?completed=...
//GET /tasks?limit=10&skip=0 -- Skip a pagina que é
//GET /task?sortBy=createdAt:asc
router.get ('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts [1] === 'desc' ? -1 : 1 // true:false
    }

    try {
        //const tasks = await Task.find({})
        // 1 Maneira
        //const tasks = await Task.find({owner: req.user._id})
        //res.send (tasks)
        // 2 Maneira
        await req.user.populate({
            path: 'tasks',
            // É tipo a Query
            match,
            options: {
                //Se o limit for vazio ou diferente de um numero ignora (Comportamento normal)
                limit: parseInt (req.query.limit),
                skip: parseInt (req.query.skip),
                sort
            }
        }).execPopulate()
        res.send (req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }

    /*
    Task.find({}).then ((tasks)=>{
        res.send (tasks)
    }).catch ((e) =>{
        res.status(500).send()
    })*/
})

router.get ('/tasks/:id', auth ,async (req, res) => {
    const _id = req.params.id;
   
   try {
       //const task = await Task.findById(_id)
        const task = await Task.findOne ({_id, owner: req.user._id})

       if (!task) return res.status(404).send()
       res.send (task)
   } catch (e) {
        res.status(500).send()
   }
   
    /* Task.findById(_id).then((task) => {
        if (!task) return res.status(404).send()
        res.send (task)
    }).catch((e) => {
        res.status(500).send()
    })*/
})

router.patch ('/tasks/:id', auth ,async (req,res) => {
    // Update Task by ID
    const updates = Object.keys(req.body)
    const alloweUpdates = ['description','completed']
    const isValidOperation = updates.every((update) => alloweUpdates.includes(update))
    //Retorna true se corresponderem se não false se tiver um errado ou a mais retorna false a menos retorna true

    if (!isValidOperation){
        return res.status(400).send({error: 'Invalid Updates!'})
    }

    try {
        // encontra a subtitui pelo valo caso tenha, caso não tenha deixa estar
        //const task = await Task.findById(req.params.id)

        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) return res.status(404).send()

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        res.send (task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete task

router.delete ('/tasks/:id' , auth ,async (req, res) => {
    try {
        //const task = await Task.findByIdAndDelete (req.params.id)
        const task = await Task.findOneAndDelete ({_id: req.params.id, owner: req.user._id})
        if (!task) return res.status(404).send()

        res.send (task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router