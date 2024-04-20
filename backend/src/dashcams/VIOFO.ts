import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'
import Fs from 'fs'
import Path from 'path'
import { GlobalState } from '../GlobalState'
import { Settings } from '../Settings'
import { enoughSpaceAvailable } from '../utils'
import { JSDOM } from 'jsdom'


const protocolAndIp = 'http://192.168.1.254'

const { window } = new JSDOM();
const { DOMParser } = window;

interface File {
  NAME: string
  FPATH: string
  SIZE: number
  TIMECODE: number
  TIME: string
  ATTR: number
}

interface FileListResponse {
  LIST: { ALLFile: Array<{ File: File }> }
}

export class VIOFO {
  
  public static async downloadVideosFromDashcam () {
    const downloadDirectory = await Settings.getDownloadDirectory()
    const response = await axios.get(protocolAndIp + '/DCIM/Movie')

    const parser = new XMLParser()
    const parsedResponse: FileListResponse = parser.parse(await response.data)
        console.log(await response.data)
        const doc=new DOMParser().parseFromString(await response.data,'text/html')
      
        //const document: Document = await response.data

        const links: string[] = [];
        const tableRows: NodeListOf<HTMLTableRowElement> = doc.querySelectorAll('tr');
        tableRows.forEach((row: HTMLTableRowElement) => {
          const link: HTMLAnchorElement | null = row.querySelector('a');
          if (link) {
            const href: string | null = link.getAttribute('href');
            if (href) {
              links.push(href);
            }
          }
        });
        console.log(links);



        for(const file of links){

          let downloadUrl = protocolAndIp + file
          console.log(downloadUrl)
          if(file != '/DCIM/Movie/Parking' && file !='/DCIM/Movie/RO'){
            await VIOFO.downloadVideo(file,downloadDirectory,downloadUrl)
          
          }
          
        }
   
  }

  public static async downloadParkingVideosFromDashcam () {
    const downloadDirectory = await Settings.getDownloadDirectory()
    const response = await axios.get(protocolAndIp + '/DCIM/Movie/Parking')

    const parser = new XMLParser()
    const parsedResponse: FileListResponse = parser.parse(await response.data)
        console.log(await response.data)
        const doc=new DOMParser().parseFromString(await response.data,'text/html')
      
        //const document: Document = await response.data

        const links: string[] = [];
        const tableRows: NodeListOf<HTMLTableRowElement> = doc.querySelectorAll('tr');
        tableRows.forEach((row: HTMLTableRowElement) => {
          const link: HTMLAnchorElement | null = row.querySelector('a');
          if (link) {
            const href: string | null = link.getAttribute('href');
            if (href) {
              links.push(href);
            }
          }
        });
        console.log(links);



        for(const file of links){

          let downloadUrl = protocolAndIp + file
          console.log(downloadUrl)
          if(file != '/DCIM/Movie/Parking' && file !='/DCIM/Movie/RO'){
            await VIOFO.downloadVideo(file,downloadDirectory+'/Parking',downloadUrl)
          
          }
          
        }
    GlobalState.dashcamTransferDone = true

  }

  private static async deleteVideo (downloadUrl: string) {
    console.log('deleting video', downloadUrl)
    await axios.delete(downloadUrl)
  }

  private static async deleteOldDayVideoFromDisk(diskPath: string){
    
    const files = await Fs.promises.readdir(diskPath);
    const sortedFiles = files.sort((a, b) => {
      const statA = Fs.statSync(Path.join(diskPath, a));
      const statB = Fs.statSync(Path.join(diskPath, b));
      return statA.birthtime.getTime() - statB.birthtime.getTime();
    });
    const filesToDelete = sortedFiles.slice(0, 20);
    for (const file of filesToDelete) {
      const filePath = Path.join(diskPath, file);
      await Fs.promises.unlink(filePath);
    }
  }


  private static async downloadVideo (file: string, downloadDirectory: string, downloadUrl: string) {
    this.deleteOldDayVideoFromDisk(downloadDirectory) 
    if (!await enoughSpaceAvailable(100 * 1024 * 1024)) {
      console.log('Not enough space available.')
      this.deleteOldDayVideoFromDisk(downloadDirectory)  //delete oldest 20 file from path
      GlobalState.dashcamTransferDone = true
      throw new Error('Not enough space available')
    }
    return await new Promise((resolve, reject) => {
      console.log('Downloading  video', file)

      const str =file.split("/")

      const path = Path.resolve(downloadDirectory,str[str.length-1])
      const writer = Fs.createWriteStream(path)
          console.log(path)
          console.log(downloadUrl)
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      axios.get(downloadUrl, { responseType: 'stream' }).then(stream => {
        stream.data.pipe(writer)
      })

      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  }
  
  

  
}
