
const {GraphQLDateTime} = require('graphql-iso-date')
const userResolver = require('./user')
const taskResolver = require('./task')


const customDateScalarResolver = {
 Date: GraphQLDateTime

}
module.exports = [
  userResolver,
  taskResolver,
  customDateScalarResolver
];