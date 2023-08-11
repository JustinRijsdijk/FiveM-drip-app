/**
 * CONFIG:
 */
const config = {
    allowedVehicleModels: [
        'spawnnaam1',
        'spawnnaam2',
        'rws'
    ]
}

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
    ped = GetPlayerPed(-1)
    vehicle = GetVehiclePedIsIn(ped, true)
}

/**
 * Lowers DRIP by calling native code for the convertible roof.
 */
const lowerDRIP = () =>
{
    getPedAndVehicle()

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
    getPedAndVehicle()

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
    getPedAndVehicle()

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
    // Load and fill map of allowed vehicles
    allowedVehicleModels = config.allowedVehicleModels.map((vehicleModel) => {
        return GetHashKey(vehicleModel)
    })

    // initially get ped and vehicle on script start
    getPedAndVehicle()
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


initDripApp()