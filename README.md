# Plants Database GraphQL API

## Usage

#### Prequesites

This project needs following dependencies not listed in package.json

- Node version 10.x
- Docker
- Docker-Compose
- Prisma verison 1.8.3

#### Installing
Boot up the prisma database
```
cd database
docker-compose up -d
prisma deploy
```

start the GraphQL node server
```
npm install
npm start
```

#### Testing
To run the test suite simply run
```
npm test
```


#### Using

Two enpoints are live on http://localhost:8000

| Endpoint         | Description                                         |
| ---------------- | --------------------------------------------------- |
| `/graphql`       | GET/POST requests go here                           |
| `/playground`    | Graphical interface for schema exploration          |
| `/subscriptions` | Making subscriptions (e.g. via websockets) |

## Built With
- [Prisma](https://github.com/prismagraphql/prisma)

## License
This project is licensed under the MIT License

<!-- ## Acknowledgements -->
<!-- #### Further documentation
check out the repository and open `./doc/schema/index.html` in -->
