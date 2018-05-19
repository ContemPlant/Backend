# Plants Database GraphQL API

## Usage

#### Prequesites

This project needs following dependencies not listed in package.json

- Node version 10.x
- Docker
- Prisma verison 1.6.3

#### Installing
Boot up the prisma database
```
prisma local up
prisma deploy
```

start the GraphQL node server
```
npm install
npm start
```

#### Using

Two enpoints are live on http://localhost:8000

| Endpoint                              | Description                                              |
| -------------------------------- | -------------------------------------------------------- |
| `/graphql`                         | GET/POST Requests go here        |
| `/playground`                      | Graphical Interface for schema exploration |

<!-- #### Further documentation
check out the repository and open `./doc/schema/index.html` in -->