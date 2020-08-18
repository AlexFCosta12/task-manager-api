//SRUD Create Read update delete

//const mongoDB = require('mongodb');
//const MongoClient = mongoDB.MongoClient;
//const ObjectID = mongoDB.ObjectID

// Segunda maneira de fazer o que está em cima
const {MongoClient, ObjectID} = require('mongodb')

const connectionURL= "mongodb+srv://CostaUser:AlexCosta12@clusteralex.m8gjz.mongodb.net"
const databaseName = 'task-manager'

//useUnifiedTopology: true
//userNewURLParser: true
MongoClient.connect (connectionURL,{useNewUrlParser: true}, (error, client) => {
    if (error){
        return console.log('Unable to connect Database');
    }
    
    const db = client.db(databaseName)

    /*db.collection('users').updateOne({
        _id : new ObjectID("5f05ffaccc448934c45d5ca5")
    }, {
        $inc:{
            age: 1
        }
    }).then((result)=>{
        console.log(result)
    }).catch((error)=>{
        console.log (error)
    })*/

   /*db.collection('task').updateMany ({
        completed: false
    },{
        $set: {
            completed: true
        }
    }).then ((result)=>{
        console.log (result.modifiedCount)
    }).catch ((error) =>{
        console.log(error)
    })*/

    /*db.collection('users').deleteMany({
        age: 26
    }).then ((result) => {
        console.log(result)
    }).catch ((error) => {
        console.log (error)
    })*/

    db.collection('task').deleteOne({
        _id: new ObjectID("5f06e49a29141e0a8811359a")
    }).then ((result) => {
        console.log(result)
    }).catch ((error) => {
        console.log (error)
    })


})

//CostaUser:E4AI4kTkGH0c98bs@
//sample_analytics?retryWrites=true&w=majority";