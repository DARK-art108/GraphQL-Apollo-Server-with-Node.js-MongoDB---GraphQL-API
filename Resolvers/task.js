
const {combineResolvers} = require('graphql-resolvers')

const {stringToBase64, base64ToString } = require('../helper')
const Task = require('../database/Models/task')
const User = require('../database/Models/user')
const { isAuthenticated, isTaskOwner} = require('./middleware')
const task = require('../typeDefs/task')

module.exports = {
  Query: {
    tasks:combineResolvers(isAuthenticated,async (_,{ cursor,limit=10 },{loggedInUserId}) => {
      try {
        const query = { user: loggedInUserId}
        if(cursor){
          query['_id'] = {
            '$lt': base64ToString(cursor)
          }
        }
        let tasks = await Task.find(query).sort({_id: -1}).limit(limit + 1)
        const hasNextPage = tasks.length > limit
        tasks = hasNextPage ? tasks.slice(0, -1) : tasks
        return {

          taskFeed: tasks,
          pageInfo: {
            nextPageCursor: hasNextPage ? stringToBase64(tasks[tasks.length - 1].id) : null,
            hasNextPage
          }

        }
      } catch (error) {
        console.log(error)
        throw error 
      }
     
    }),
    task:combineResolvers(isAuthenticated,isTaskOwner, async(_, { id }) => {
      try {
        const task = await Task.findById(id)
      return task
      } catch (error) {
        console.log(error)
        throw error
        
      }
      
    }) ,
  },
  Mutation: {
    createTask: combineResolvers(isAuthenticated,async(_, { input }, {email}) => {
      try {
             const user = await User.findOne({email})
     const task = new Task({...input, user:user.id})
     const result = await task.save();
     user.tasks.push(result.id)
     await user.save();
     return result
      } catch (error) {
        
      }

    }),
    updateTask: combineResolvers(isAuthenticated, isTaskOwner, async (_, {id, input})=>{

      try {
        const task = await Task.findByIdAndUpdate(id, {...input},{new: true})
        return task
      } catch (error) {
        console.log(error)
        throw error
      }

      

    }),
    deleteTask: combineResolvers(isAuthenticated,isTaskOwner,async (_,{id},{loggedInUserId}) =>{

      try {
      const task = await Task.findByIdAndDelete(id)
      await User.updateOne({_id: loggedInUserId },{$pull: {tasks: task.id}})
      return task;
      } catch (error) {
        console.log(error)
        throw error
      }

      

    })


  },
  Task: {
    user: async(parent) => {
      try {
        const user = await User.findById(parent.user)
      return user
      } catch (error) {
        console.log(error)
        throw error
        
      }
      
    }
  }
}