
/**
 * Shortcuts for making commonly used database operations
 * @module database-shorthands
 */
module.exports = ({ getUserId }) => {

    /**
     * returns true if the plant with the given plantID is allowed to be edited from the given context
     * @param {Object} context context in which plant editing permission are checked...
     * @param {String} plantID the id of the plant 
     */
    async function hasPlantEditPermissionInContext(context, plantID) {
        const plantOwnerID = (await context.db.query.plant({
            where: { id: plantID }
        }, `{ owner { id } }`)).owner.id

        if (plantOwnerID != getUserId(context))
            return false

        return true
    }
    /**
     * Returns the ardu which has loaded the plant with the given ID
     * @param {Object} context the context
     * @param {String} plantID the plant id
     */
    async function arduPlantIsLoadedToInContext(context, plantID) {
        return (await context.db.query.ardus({ where: { loadedPlant: { id: plantID } } }))[0]
    }

    /**
     * Returns the plant which is currently loaded onto ardu
     * 
     * @param {String} arduID 
     * @param {Object} context 
     */
    async function loadedPlantOnArduWithID(arduID, context) {
        return (await context.db.query.ardus( { where: { arduId: arduID } }, "{loadedPlant { id }}"))[0].loadedPlant
    }

    // Export the functions
    return {
        hasPlantEditPermissionInContext,
        arduPlantIsLoadedToInContext,
        loadedPlantOnArduWithID
    }
}