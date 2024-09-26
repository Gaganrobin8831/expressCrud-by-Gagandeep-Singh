// server.js
const express = require('express');
const mongoose = require('mongoose');
const { ApolloServer, gql } = require('apollo-server-express');
const userService = require('./services/user.services');
const compression = require('compression')

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/graphql-demo')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const app = express();

// GraphQL schema
const typeDefs = gql`
  type User {
    id: ID
    name: String!
    email: String!
  }

  type Query {
    users: [User]
  }

  type Mutation {
    createUser(name: String!, email: String!): User
  }
`;

// Resolvers
const resolvers = {
  Query: {
    users: async () => await userService.getAllUsers(),
  },
  Mutation: {
    createUser: async (_, { name, email }) => {
      return await userService.createUser(name, email);
    },
  },
};

// Create an Apollo Server instance
const server = new ApolloServer({ typeDefs, resolvers });

app.use(compression())
// Start the server asynchronously
const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer();