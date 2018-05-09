const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')

const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const AuthPayload = require('./resolvers/AuthPayload')

const resolvers = {
    Query,
    Mutation,
    AuthPayload
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: req => ({
        ...req, 
        db: new Prisma({
            typeDefs: 'src/generated/prisma.graphql',
            endpoint: 'http://167.99.240.197:4466/plantsdb/dev',
            secret: 'tobias',
            debug: true,
        }),
    }),
})

server.start(() => console.log(`Server is Running on http://localhost:4000`))