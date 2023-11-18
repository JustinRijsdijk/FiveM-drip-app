
/**
 * config?. DO NOT CHANGE ANYTHING HERE.
 */
const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'config?.json'));

/**
 * EVENT LISTENERS. ADD YOUR OWN HOOKS HERE IF YOU WANT TO.
 */
on('onResourceStart', (resourceName) => {
    /**
     * Register event handler for the noConfigFileFound error.
     */
    on(`drip:error:noConfigFileFound`, (message) => {
        // Run something on noConfigFileFound error, for example, show OkOkNotify alert. 
        exports.okokNotify.Alert(message, 10000, 'error')
    })

    /**
     * Register event handler for the successfull Initialized event.
     */
    on(`${config?.eventPrefix ?? 'drip'}:success:initialized`, (message) => {
        // Run something on successfull initialize, for example, show OkOkNotify alert.
        exports.okokNotify.Alert(message, 10000, 'success')
    })

    /**
     * Register event handler for all known errors.
     */
    if(config?.translations?.errors?.length) {
        Object.keys(config?.translations?.errors).forEach((key) => {
            on(`${config?.eventPrefix ?? 'drip'}:error:${key}`, (message) => {
                // Run something on an error, for example, show OkOkNotify alert. 
                exports.okokNotify.Alert(message, 10000, 'success')
            })
        });
    }
});

/**
 * IF YOU DO NOT KNOW WHAT YOU ARE DOING
 * DO NOT CHANGE ANYTHING BELOW HERE.
 * IF YOU DO, AND FUCK IT UP, CALL YOUR MOM AND CRY.
 * IF YOUR NAME IS Dyverze/Ryuk, CALL UR DAD.
 */
let ped = null
let vehicle = null
let dripAppIsOpen = false;
let activeExtra = null
let allowedVehicleModels = []

/**
 * 
 * @param {*} str 
 * @param {*} context 
 * @returns String
 */
function replaceVariablesInString(str, context) {
    return str.replace(/\{(\w+)\}/g, function(match, variable) {
        return context[variable] || match;
    });
}

/**
 * Emits a netEvent with the configured prefix
 * 
 * @param {*} eventName 
 * @param {*} payload 
 */
const sendEvent = (eventName, payload) => {
    emit(`${config?.eventPrefix ?? 'drip'}:${eventName}`, payload)
}

/**
 * Reports the error, and emits a netEvent using sendEvent()
 * 
 * @param {*} errorName 
 * @param {*} context 
 */
const error = (errorName, context = null) => {
    let translation = config?.translation?.error[errorName] ?? errorName

    if(context) {
        translation = replaceVariablesInString(translation, context)
    }

    console.error(translation)

    sendEvent(`error:${errorName}`, translation)
}

/**
 * Set local PED and VEHICLE entities.
 * Necessary to get the DRIP vehicle to call the convertible roof natives.
 */
const getPedAndVehicle = () => {
    // Get the local PED
    ped = GetPlayerPed(-1)

    // If you are allowed to control the DRIP from the outside of the vehicle
    // And you have a vehicle registred, and you are currently not in (another) vehicle
    // Do not try to get and set the vehicle again.
    if (config?.canControlOutsideOfVehicle && vehicle) {
        return isPlayerInRangeOfVehicle()
    } else {
        vehicle = GetVehiclePedIsIn(ped, true)
    }

    if (!vehicle) {
        return false
    }

    // Check if the player ped is in the driver's seat, only if ped is in a vehicle
    if (!config?.passengerCanControlDrip && GetPedInVehicleSeat(vehicle, -1) != ped && vehicle) {
        error("passengerNotAllowed")
        return false;
    }

    return true
}

/**
 * Check if player is in the given range of the vehicle
 */
const isPlayerInRangeOfVehicle = () => {
    if (config?.restrictOutsideControlToRange && parseFloat(config?.allowedDripRange)) {
        const pedCoords = GetEntityCoords(ped);
        const vehicleCoords = GetEntityCoords(vehicle);
    
        const distance = Math.sqrt(
            Math.pow(pedCoords[0] - vehicleCoords[0], 2) +
            Math.pow(pedCoords[1] - vehicleCoords[1], 2) +
            Math.pow(pedCoords[2] - vehicleCoords[2], 2)
        );
    
        return distance <= config?.allowedDripRange;
    }

    if(!parseFloat(config?.allowedDripRange)) {
        error("notAllowedOutsideControlRange", {
            "range": config?.allowedDripRange
        })
        return true
    }
    
    return true
}

/**
 * Lowers DRIP by calling native code for the convertible roof.
 */
const lowerDRIP = () =>
{
    if(!getPedAndVehicle()) {
        return false
    }

    RaiseConvertibleRoof(
        vehicle, 
        false
    )
}

/**
 * Raises DRIP by calling native code for the convertible roof.
 */
const raiseDRIP = () => 
{
    if(!getPedAndVehicle()) {
        return false
    }
    
    LowerConvertibleRoof(
        vehicle, 
        false
    )
}

/**
 * Resets the active extra, if there is one.
 */
const resetActiveExtra = () => {
    if(activeExtra) {
        if(IsVehicleExtraTurnedOn(vehicle, activeExtra)) {
            SetVehicleExtra(vehicle, activeExtra, 1)
            return
        }
    }

    return
}

/**
 * Toggles the given extra on the current vehicle. if the extra is already active, it will be reset.
 * 
 * @param {*} extra 
 */
const toggleDripExtra = (extra) => {
    if(!getPedAndVehicle()) {
        return false
    }

    if(!DoesExtraExist(vehicle, extra)) {
        error("extraDoesNotExist", {
            "extra": extra
        })
        return
    }

    if(IsVehicleExtraTurnedOn(vehicle, extra)) {
        SetVehicleExtra(vehicle, extra, 1)
        activeExtra = null
        return
    }

    resetActiveExtra()
    SetVehicleExtra(vehicle, extra, 0)
    activeExtra = extra

    return
}

/**
 * Toggles the script's internal state, and sends a message to NUI, to toggle the UI state as well.
 * 
 * @param {boolean} forceClose 
 */
const toggleDripApp = (forceClose = false) => 
{
    // toggle dripAppIsOpen. If forceClose is true, force it to close
    dripAppIsOpen = forceClose ? false : !dripAppIsOpen
    SetNuiFocus(dripAppIsOpen, dripAppIsOpen)
    SendNUIMessage({
        type: "ui"
    })
}

/**
 * Function that loads PED and VEHICLE and enables the DRIP app
 */
const initDripApp = () => {
    // Load config file
    if(!config) {
        // Seems a bit ambogious, but here the config is not loaded yet, so we can't use the error() function
        console.error('No config file found. Please make sure you have a config.json file in your resource folder.')
        sendEvent(`error:noConfigFileFound`, `No config file found. Please make sure you have a config.json file in your resource folder.`)
        return
    }

    // Load and fill map of allowed vehicles
    allowedVehicleModels = config?.allowedVehicleModels.map((vehicleModel) => {
        return GetHashKey(vehicleModel)
    })

    // initially get ped and vehicle on script start
    getPedAndVehicle()

    // Initialize the app
    setImmediate(() => {
        emit('chat:addSuggestion', `/${config?.commandName}`, config?.translations.commandHint);
      });

    /**
     * Register command to open the Drip App
     */
    RegisterCommand(config?.commandName, (source, args) => { 
        if(!getPedAndVehicle()) {
            return false
        }

        if(allowedVehicleModels.includes(GetEntityModel(vehicle))) {
            return toggleDripApp()
        }
        error("notAllowedVehicleModel")
    })

    /**
     * Register NUI Callback to close the Drip App
     */
    RegisterNuiCallbackType("close");
    on("__cfx_nui:close", (data, cb) => {
        toggleDripApp(true)

        return cb()
    })

    /**
     * Register NUI Callback to raise the Drip
     */
    RegisterNuiCallbackType("raiseDrip");
    on("__cfx_nui:raiseDrip", (data, cb) => {
        raiseDRIP()

        return cb()
    })

    /**
     * Register NUI Callback to lower the Drip
     */
    RegisterNuiCallbackType("lowerDrip");
    on("__cfx_nui:lowerDrip", (data, cb) => {
        lowerDRIP()

        return cb()
    })

    /**
     * Register NUI Callback to toggel Drip extra
     */
    RegisterNuiCallbackType("toggleDripExtra");
    on("__cfx_nui:toggleDripExtra", (data, cb) => {
        toggleDripExtra(data.extra)

        return cb()
    })

    exports("toggleDrip", () => {
        if(!getPedAndVehicle()) {
            return false
        }

        if(allowedVehicleModels.includes(GetEntityModel(vehicle))) {
            return toggleDripApp()
        }
        error("notAllowedVehicleModel")
    })

    // App is initialized, send event to client
    const translation = replaceVariablesInString(config?.translations.appInitialized, {
        "commandName": config?.commandName
    })
    console.log(translation)
    sendEvent(`success:initialized`, translation)
}

// Init the Drip App on script start (resource (re) start)
initDripApp()