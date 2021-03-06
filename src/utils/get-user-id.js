const jwt = require('jsonwebtoken')


module.exports = ({ APP_SECRET }) =>
    /**
     * Extracts userId from contest
     *
     * @param {Object} context The context object from graphQL
     * @returns userId
     */
    function getUserId(context) {
        const Authorization = (() => {
            if (context.request) {
                //usual request
                return context.request.get('Authorization')
            }

            // for subscriptions
            return context.connection.context.Authorization
        })()

        // Check if auth headers are set
        if (!Authorization) throw new Error('Not authenticated')

        // extreact userId
        const token = Authorization.replace('Bearer ', '')
        const { userId } = jwt.verify(token, APP_SECRET)
        return userId
    }

