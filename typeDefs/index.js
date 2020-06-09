const { gql } = require('apollo-server-express');

const userTypeDefs = require('./user');
const taskTypeDefs = require('./task');

const typeDefs = gql`
scalar Date

type Query {
    _: String
  }
  type Mutation {
    _: String
  }
type Subscription{
  _: String
}

`


module.exports = [
    typeDefs,
    userTypeDefs,
    taskTypeDefs
  ]
  