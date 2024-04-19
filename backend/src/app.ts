#!/usr/bin/env node
import fs from 'fs'
import http from 'http'
import { DashcamDownloader } from './DashcamDownloader'
import { GlobalState } from './GlobalState'
import { HomeTransfer } from './HomeTransfer'
import { RaspiLED } from './RaspiLed'
import { Settings } from './Settings'
import { sleep } from './utils'
import { Wifi } from './WIFI'

const appStart = async () => {
  preventMultipleRuns()

  console.log('App started')

  RaspiLED.initialize()

  if (!fs.existsSync((await Settings.getDownloadDirectory()) + '/locked')) {
    fs.mkdirSync((await Settings.getDownloadDirectory()))
    fs.mkdirSync((await Settings.getDownloadDirectory()) + '/locked')
  }

  await Wifi.enableWifi()

  while (true) {
    await sleep(5000)

    if (await Wifi.isConnectedToDashcamWifi() && !GlobalState.dashcamTransferDone) {
      await DashcamDownloader.downloadLockedVideosFromDashcam()
    }  else {
      try {
        if (!GlobalState.dashcamTransferDone) {
          await Wifi.tryToConnectToDashcamWifi()
          continue
        }
      } catch {
        console.log('Could not connect to dashcam wifi')
      }

    
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
appStart()

function preventMultipleRuns () {
  const server = http.createServer(function (req, res) {
  })
  // make sure this server doesn't keep the process running
  server.unref()

  server.on('error', function (e) {
    console.log("Application already running - can't run more than one instance")
    process.exit(1)
  })

  server.listen(32890, function () {
  })
}
