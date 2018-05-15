const { getUserId } = require('../utils')

const info = () => `This is the API of our PlantsDb`

const plants = (root, args, context, info) =>
    context.db.query.plants({
        where: {
            owner: { id: getUserId(context) }
        }
    }, info)



module.exports = {
    info, plants
}