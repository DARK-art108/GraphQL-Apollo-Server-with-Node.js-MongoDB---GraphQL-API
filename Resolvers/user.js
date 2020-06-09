const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {combineResolvers} = require('graphql-resolvers')

const User = require('../database/Models/user')
const Task = require('../database/Models/task')
const {isAuthenticated} = require('./middleware')
const PubSub = require('../subscription')
const {userEvents} = require('../subscription/events')

module.exports = {
  Query: {
    
    user: combineResolvers(isAuthenticated, async (_,__, {email}) =>{
      try {
        const user =  await User.findOne({ email })
        if(!user){
         throw new Error('User not found!')
      }
        return user
      } catch (error) {

        console.log(error)
        throw error
        
      }
      
    })
  },
  Mutation: {
     signup: async (_, {input }) => {
       try{

        const user = await User.findOne({ email: input.email })
        if (user) {
          throw new Error('Email already in use')
        }

        const hashedPassword = await bcrypt.hash(input.password, 12)
        const newUser = new User({...input, password: hashedPassword })
        const result = await newUser.save()
        PubSub.publish(userEvents.USER_CREATED,{
          userCreated: result
        })
        console.log(result.id, typeof result.id)//result.id virtual getter type string
        console.log(result._id, typeof result._id)//underscore id type object
        return result

       }catch(error){

        console.log(error)
        throw error
     

     }

     
    } ,

    login:async (_,{input}) => {
      try {

        const user = await User.findOne({email: input.email})
        if(!user){
          throw new Error('User not found')
        }
        const isPasswordValid = await bcrypt.compare(input.password,user.password)
        if(!isPasswordValid){
          throw new Error('Incorrect Password')
        }
        const secret = process.env.JWT_SECRET_KEY || 'mysecretkey'
        const token = jwt.sign({email: user.email},secret,{expiresIn: '1d'} )
        return {token}

      } catch (error) {

        console.log(error)
        throw error
        
      }
      
    }


  },
  Subscription: {
   userCreated: {
     subscribe: () => PubSub.asyncIterator(userEvents.USER_CREATED)
   }
  },
  User: {
    tasks: async ({ id }) => {
      try {
         const tasks = await Task.find({ user: id})
         return tasks
      } catch (error) {
        console.log(error)
        throw error
      }

     

    }
    
  }
}