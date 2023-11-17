# FiveM-drip-app
A FiveM app that allows you to control the DRIP of the RWS Toyota Hilux made by [TeamMOH](https://discord.com/invite/9FamjGY6mM)

![Drip App Image](https://cdn.discordapp.com/attachments/704963620643274752/1175143169176911892/Screenshot_2023-11-17_at_19.38.59.png?ex=656a285c&is=6557b35c&hm=67a7318f94f6d7c0c98ed94a627faa277dae56e8ddbd2ca447c7b533fcbb7c51&)

Download the latest release [here](https://github.com/JustinRijsdijk/FiveM-drip-app/releases/tag/latest)

## How to use
1. Download the latest release
2. Extract the zip file and place the contents inside a folder called drip_app into your FiveM resources folder
3. Ensure you have `ensure yarn` set in your server.cfg
4. Add `ensure drip_app` to your server.cfg
5. Open the index.js file. In here there is an object which is called `config`. In here we have a key `allowedVehicleModels`. Put the model names on which the Drip App is usable in here.
6. Restart your server.
7. Type `/drip` in the chat to open the app, and use the app to control your DRIP.
8. Close the app by pressing `X` in the top right corner.
8. Enjoy!
