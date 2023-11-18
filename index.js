/**
 * CONFIG:
 */
let config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'config.json'));

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
 * Set local PED and VEHICLE entities.
 * Necessary to get the DRIP vehicle to call the convertible roof natives.
 */
const getPedAndVehicle = () => {
    // Get the local PED
    ped = GetPlayerPed(-1)

    // If you are allowed to control the DRIP from the outside of the vehicle
    // And you have a vehicle registred, and you are currently not in (another) vehicle
    // Do not try to get and set the vehicle again.
    if (config.canControlOutsideOfVehicle && vehicle && !GetVehiclePedIsIn(ped, true)) {
        return isPlayerInRangeOfVehicle()
    } else {
        vehicle = GetVehiclePedIsIn(ped, true)
    }

    if (!vehicle) {
        return false
    }

    // Check if the player ped is in the driver's seat
    if (!config.passengerCanControlDrip && GetPedInVehicleSeat(vehicle, -1) != ped) {
        vehicle = null
        console.error("You are not allowed to control the DRIP if you are a passenger")
        return false;
    }

    return true
}

/**
 * Check if player is in the given range of the vehicle
 */
const isPlayerInRangeOfVehicle = () => {
    if (config.restrictOutsideControlToRange && parseFloat(config.allowedDripRange)) {
        const pedCoords = GetEntityCoords(ped);
        const vehicleCoords = GetEntityCoords(vehicle);
    
        const distance = Math.sqrt(
            Math.pow(pedCoords[0] - vehicleCoords[0], 2) +
            Math.pow(pedCoords[1] - vehicleCoords[1], 2) +
            Math.pow(pedCoords[2] - vehicleCoords[2], 2)
        );
    
        return distance <= config.allowedDripRange;
    }

    if(!parseFloat(config.allowedDripRange)) {
        console.error('Config value for allowedDripRange is not a number. Enabling Drip control anyways.')
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

const resetActiveExtra = () => {
    if(activeExtra) {
        if(IsVehicleExtraTurnedOn(vehicle, activeExtra)) {
            SetVehicleExtra(vehicle, activeExtra, 1)
            return
        }
    }

    return
}

const toggleDripExtra = (extra) => {
    if(!getPedAndVehicle()) {
        return false
    }

    if(!DoesExtraExist(vehicle, extra)) {
        console.log(`extra ${extra} does not exist on the current vehicle`)
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
        console.error('No config file found. Please make sure you have a config.json file in your resource folder.')
        return
    }

    // Load and fill map of allowed vehicles
    allowedVehicleModels = config.allowedVehicleModels.map((vehicleModel) => {
        return GetHashKey(vehicleModel)
    })

    // initially get ped and vehicle on script start
    getPedAndVehicle()

    // Initialize the app
    console.log('Drip App has been initiated. You can use it by typing \'/drip\'')
    // initialize command hint
    setImmediate(() => {
        emit('chat:addSuggestion', '/drip', 'Open the DRIP app to control your Drip.');
      });
}

/**
 * Register command to open the Drip App
 */
RegisterCommand("drip", (source, args) => { 
    if(!getPedAndVehicle()) {
        return false
    }

    if(allowedVehicleModels.includes(GetEntityModel(vehicle))) {
        return toggleDripApp()
    }
    console.error('Current vehicle is not whitelisted')
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

// Init the Drip App on script start (resource (re) start)
initDripApp()