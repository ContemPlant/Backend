function plantLoadedSubscribe(parent, args, context, info) {
    return context.db.subscription.ardu(
        { where: { mutation_in: ['UPDATED'] } },
        info,
    )
}

const plantLoaded = {
    subscribe: plantLoadedSubscribe
}

module.exports = {
    plantLoaded,
}