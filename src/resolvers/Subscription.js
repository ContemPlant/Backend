/**
 * All subscription resolvers
 * @module Subscription
 */
module.exports = ({ utils }) => {

    // Destructure helpers form utils
    const {
        APP_SECRET,
        getUserId,
        plantState,
        hasPlantEditPermissionInContext,
        arduPlantIsLoadedToInContext,
        loadedPlantOnArduWithID
    } = utils
    
    /**
     * Subscription on a table of sensorData<type>
     *
     * @param {Object} root Parent object from query
     * @param {Object} args Query arguments
     * @param {Object} context Contains headers/database bindings
     * @param {String} info Query parameters to return tis queries attributes
     * @returns subscription iterator
     */
    function newSensorDates(parent, args, context, info) {
        return context.db.subscription.sensorDates({
            where: {
                mutation_in: ['CREATED'],
                node: { plant: { id: args.plantId } }
            }
        }, info)
    }
    /**
     * Subscription on the ardu table
     *
     * @param {Object} root Parent object from query
     * @param {Object} args Query arguments
     * @param {Object} context Contains headers/database bindings
     * @param {String} info Query parameters to return tis queries attributes
     * @returns subscription iterator
     */
    function arduChange(parent, args, context, info) {
        return context.db.subscription.ardu({
            where: args.where
        }, info)
    }


    function newPlant(parent, args, context, info) {
        const s = context.db.subscription.plant({
            where: {
                mutation_in: ['CREATED', 'UPDATED'],
                node: { owner: { id: getUserId(context) } }
            }
        }, info)

        return s
    }

    return {
        arduChange: { subscribe: arduChange },
        newSensorDates: { subscribe: newSensorDates },
        newPlant: { subscribe: newPlant }
    }
}
