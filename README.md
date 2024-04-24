# dashcam-transporter
Application running on a raspberry pi (or other debian based platforms), to transfer and archive your dashcam video files to your preferred storage

![Transfer illustration](/docs/img/transfer_illustration.svg "Transfer illustration")

# How it works
- The application is searching for the WIfi of your dashcam
- If found it connects to it in searches for locked videos (those where something happened), downloads them and deletes them from the dashcam
- The application then searches for your home network, connects and uploads the videos and deletes them from the pi


# Currently supported dashcams
- ✅ Viofo T130

# Currently supported target storages
- ✅ Samba (SMB) Windows Share


# Installation

## Automated script
- Setup raspbian lite (or other debian based os, this is not tested though) and execute

`curl -o- https://raw.githubusercontent.com/steve192/dashcam-transporter/main/install.sh | bash`
## Manual
- Setup raspbian lite (or other debian based os, this is not tested though)
    - Ensure npm is installed if using something different than raspberry pi (`sudo apt install node npm`)
- Install git and node `sudo apt update && sudo apt install git nodejs npm`
- Download clone dashcam transporter from github 
    - `git clone https://github.com/steve192/dashcam-transporter.git`
- Navigate to the directory `cd dashcam-transporter/backend`
- Install node modules `npm i`
- Build `npm run build`
- Navigate to the build result `cd dist`
- Execute setup script `sudo ./setup.sh`
- Edit the settings.ini file `nano settings.ini`
- Reboot and the script will automatically be started `sudo reboot`


# Meaning of leds
The script controls the raspberrys leds
- Blinking LEDs - Waiting for connections to dashcam of home network (Will also blink if there is nothing to transfer)
- LEDs on - Transfer is currently running
