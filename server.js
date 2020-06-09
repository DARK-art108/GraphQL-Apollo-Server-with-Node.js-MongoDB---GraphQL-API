const express = require('express')
const { ApolloServer, gql, AddArgumentsAsVariables } = require('apollo-server-express')

//cross origin request handle
const cors = require('cors')
const dotenv = require('dotenv')


const {connection} = require('./database/util')
const {verifyUser} = require('./helper/context')
const resolvers = require('./Resolvers')
const typeDefs = require('./typeDefs')


const { keys } = require('./typeDefs')
dotenv.config()
//db connectivity
connection()

const app = express()
//body parser middleware
 
app.use(cors())

app.use(express.json());



const apolloServer = new ApolloServer({
    

    typeDefs,//schema
    resolvers,//how to get data for particular schema
    context: async({req, connection})=> {//if we want to get something as a per request basis then we declare context func
        const contextObj = {}
        if (req){
            await verifyUser(req) 
        contextObj.email= req.email,
        contextObj.loggedInUserId = req.loggedInUserId
        }
        return contextObj
},
formatError: (error) => {

    
    return {
        message: error.message
    }

}
})

apolloServer.applyMiddleware({app, path:'/graphql'})

//if the port 3001 is not found then 3000 will be the default port
const PORT= process.env.PORT || 3000

app.use('/' , (req,res,next) =>{
    res.send({message: 'Hello'})
})

const httpServer = app.listen(PORT, () =>{
    console.log(`Server listening on PORT: ${PORT}`)
    console.log(`Graphql Endpoint: ${apolloServer.graphqlPath}`)
})


apolloServer.installSubscriptionHandlers(httpServer)


