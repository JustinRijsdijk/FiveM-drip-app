/**
 * IF YOU DO NOT KNOW WHAT YOU ARE DOING
 * DO NOT CHANGE ANYTHING BELOW HERE.
 * IF YOU DO, AND FUCK IT UP, CALL YOUR MOM AND CRY.
 * IF YOUR NAME IS Dyverze/Ryuk, CALL UR DAD.
 */

/**
 * CONFIG:
 */
let config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'config.json'));

/**
 * Register event handler for the noConfigFileFound error.
 */
onNet(`drip:error:noConfigFileFound`, (message) => {
    // Run something on noConfigFileFound error, for example, show OkOkNotify alert. 
    exports.okokNotify.Alert(message, 10000, 'error')
})

if(!config) {
    console.error('Config file is not found!')
    return
} else {

    /**
     * Register event handler for the successfull Initialized event.
     */
    onNet(`${config.eventPrefix}:success:initialized`, (message) => {
        // Run something on successfull initialize, for example, show OkOkNotify alert.
        exports.okokNotify.Alert(message, 10000, 'success')
    })

    /**
     * Register event handler for all known errors.
     */
    Object.keys(config.translations.errors).forEach((key) => {
        onNet(`${config.eventPrefix}:error:${key}`, (message) => {
            // Run something on an error, for example, show OkOkNotify alert. 
            exports.okokNotify.Alert(message, 10000, 'success')
        })
    });
}