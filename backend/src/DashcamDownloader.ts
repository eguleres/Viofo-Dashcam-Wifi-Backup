import { VIOFO } from './dashcams/VIOFO'
import { GlobalState } from './GlobalState'
import { RaspiLED } from './RaspiLed'
import { Settings } from './Settings'

export class DashcamDownloader {
  public static async downloadLockedVideosFromDashcam () {
    GlobalState.homeTransferDone = false
     RaspiLED.operation = 'DASHCAMTRANSFER'
    switch (await Settings.getDashcamModel()) {
      case 'VIOFOT130':
        await VIOFO.downloadLockedVideosFromDashcam()
        break
      default:
        await VIOFO.downloadLockedVideosFromDashcam()
        break
    }
  }
}
