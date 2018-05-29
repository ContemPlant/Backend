function arduSubscribe(parent, args, context, info) {
    return context.db.subscription.ardu(
        { where: args.where },
        info,
    )
}

const arduChange = {
    subscribe: arduSubscribe
}

module.exports = {
    arduChange,
}