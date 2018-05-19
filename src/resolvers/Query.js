const { getUserId } = require('../utils')

const info = () => `This is the API of our PlantsDb`

/**
 * Returns all plants for a given user
 * @param {Object} root Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 */
const plants = (root, args, context, info) =>
    context.db.query.plants({
        where: {
            owner: { id: getUserId(context) }
        }
    }, info)

/**
 * Returns the plant identified by id
 * @param {Object} root Parent object from query
 * @param {Object} args Query arguments
 * @param {Object} context Contains headers/database bindings
 * @param {String} info Query parameters to return tis queries attributes
 */
const plant = (root, args, context, info) =>
    context.db.query.plant({
        where: { id: args.id }
    }, info)

module.exports = {
    info, plants, plant
}