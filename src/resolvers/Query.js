
const info = () => `This is the API of a Hackernews Clone`

const plants = (root, args, context, info) => 
    context.db.query.plants({}, info)

module.exports = {
    info, plants
}