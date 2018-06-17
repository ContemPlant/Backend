const fs = require('fs');
const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')

const utils = require('./utils')

const Query = require('./resolvers/Query')({ utils })
const Mutation = require('./resolvers/Mutation')({ utils })
const Subscription = require('./resolvers/Subscription')({ utils })
const AuthPayload = require('./resolvers/AuthPayload')

const resolvers = {
    Query,
    Mutation,
    AuthPayload,
    Subscription
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: req => ({
        ...req,
        db: new Prisma({
            typeDefs: 'src/generated/prisma.graphql',
            endpoint: 'http://localhost:4466/plantsdb/dev',
            secret: 'tobias',
            debug: false,
        }),
    }),
})

// Options for the server
const options = {
    port: 8000,
    endpoint: '/graphql',
    getEndpoint: true, //accessing via get, if required (or just for convenience)
    subscriptions: '/subscriptions',
    playground: '/playground', // write 'false' instead to turn off playground 
    // https: { //encryption stuff (but bad encryption...)
    //     cert: fs.readFileSync("/root/certificate.pem"),
    //     key: fs.readFileSync("/root/key.pem")
    // }
}

server.start(options, ({ port }) =>
    console.log(
        `Server started, listening on port ${port} for incoming requests.`,
    ),
)