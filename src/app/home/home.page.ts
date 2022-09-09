import { Component, ViewChild, ElementRef } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FileDownload } from "capacitor-plugin-filedownload";
import { File } from '@awesome-cordova-plugins/file/ngx';
import { interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
// import { VideoPlayer } from '@awesome-cordova-plugins/video-player/ngx';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  systemMsg = '';
  videoFileName = 'salon_short.mp4'

  // variable for video files info from server
  resp;
  fileList;
  labelList;
  folderName;
  playBackUri = [];

  //test purpose
  // playBackList = [
  //   'https://hammer.pythonanywhere.com/assets/master/BLUE.mp4',
  //   'https://hammer.pythonanywhere.com/assets/master/RED.mp4',
  //   'https://hammer.pythonanywhere.com/assets/master/GREEN.mp4',
  //   'https://hammer.pythonanywhere.com/assets/master/BAR.mp4',
  // ]
  playBackList = [
    Capacitor.convertFileSrc(this.file.externalDataDirectory + '2022-09-09-05-39-24-BLUE.mp4'),
    Capacitor.convertFileSrc(this.file.externalDataDirectory + '2022-09-09-05-39-04-RED.mp4'),
    Capacitor.convertFileSrc(this.file.externalDataDirectory + '2022-09-09-05-38-44-GREEN.mp4'),
    Capacitor.convertFileSrc(this.file.externalDataDirectory + '2022-09-09-05-38-26-BAR.mp4'),
  ]

  //UI
  isShow;


  @ViewChild('videoPlayer') videoPlayer: ElementRef;

  videoPath ='';
  // videoPath = Capacitor.convertFileSrc(this.file.externalDataDirectory + this.videoFileName);
  // videoPath = 'https://hammer.pythonanywhere.com/assets/master/BAR.mp4'
  constructor(private file: File,
    // private videoPlayer: VideoPlayer,
    private http: HTTP
    ) {

  }
  ngOnInit(): void {
    // interval(60000).subscribe(() => {
      //     this.workFlow();
      // });

    this.videoPath = this.playBackList[0]; // Play the first video
  }

  playBackCount = 0
  currentVideoIndex = 0

  ngAfterViewInit() {
      this.videoPlayer.nativeElement.onloadeddata = (event) => {
          console.log('Video data is loaded.');
          // this.dataLoaded = true;
      };

      this.videoPlayer.nativeElement.onplaying = (event) => {
          console.log('Video is playering.');
          // this.videoStarted = true;
      };

      this.videoPlayer.nativeElement.onended = (event) => {
        console.log('Video is completed.');
        // Play the next video
        // this.videoPlayer.nativeElement.pause();
        this.playNext()
    };
  }
  playNext(){
    this.playBackCount = this.playBackCount + 1
    this.currentVideoIndex = this.playBackCount % this.playBackList.length;
    console.log('currentVideoIndex: ', this.currentVideoIndex);

    this.isShow = Array(this.playBackList.length).fill(false)
    this.isShow[ this.currentVideoIndex] = true; // Show the next video

    this.videoPath = this.playBackList[this.currentVideoIndex];
    console.log('videoPath: ', this.videoPath);
    // this.videoPlayer.nativeElement.currentTime = 0;
    this.videoPlayer.nativeElement.load();
    this.videoPlayer.nativeElement.play();
  }

  pauseVideo(){ // for debug purpose
    this.videoPlayer.nativeElement.pause();
  }
  playAgain(){ // for debug purpose
    this.videoPlayer.nativeElement.currentTime = 0;
    this.videoPlayer.nativeElement.play();
  }

  workFlow(){
    console.log('----- WorkFlow begin');
    // console.log('----- Downloading videos from BoardClick Inventory');
    this.connectServer().then( ()=>{
      // console.log('resp', this.resp);
      this.downloadVideos().then( ()=>{
        console.log("Play back Begin");
      });
    });
  }

  async connectServer(){
    console.log('----- connectServer');
    let operator =
    {
    title: 'POST msg from client',
    type: "type"
    }
    this.http.setDataSerializer('json');
    this.http.post('https://hammer.pythonanywhere.com/fromClient', operator, {})
    .then(data => {
      console.log("----- Got data from server");

      console.log('----- to server', data.status);
      console.log('----- to server', data.data); // data received by server
      console.log('----- to server', data.headers);
      this.resp = JSON.parse(data.data) // won't be able to pass value to variables without this line
      this.fileList = this.resp['urls'];
      this.labelList = this.resp['files'];
      this.folderName = this.resp['folderName'];
      // return true
    })
    .catch(error => {
      console.log('----- error', error.status);
      console.log('----- error', error.error); // error message as string
      console.log('----- error', error.headers);
      // return false
    });
  }

  // Download files to local storage
  async downloadVideos(){
    console.log('----- downloadVideos');

    for (let i=0; i< this.fileList.length; i++){
      console.log('fileList', this.fileList[i]);
      console.log('labelList', this.labelList[i]);
      // const pathToSave = Capacitor.convertFileSrc(Capacitor.convertFileSrc(`${this.file.externalDataDirectory}/${this.folderName}/${this.fileList[i]}`));
      const downloadLink = `https://hammer.pythonanywhere.com${this.fileList[i]}`;
      console.log('downloadLink:', downloadLink);

      FileDownload.download({
        uri: downloadLink,
        fileName: `${this.folderName}-${this.labelList[i]}`
      }).then((res) => {
          console.log('***** Download files to ', res.path);
          this.playBackUri.push(res.path)
      }).catch(err => {
          console.log(err);
      })
    }
    //end of for loop
    console.log('----- Play Back Sequence ',this.playBackUri);
  }


  // playVideo(){
  //   // // Native video Player - plug in is not functioning
  //   // this.videoPlayer.play('https://hammer.pythonanywhere.com/assets/master/BAR.mp4').then(() => {
  //   // console.log('----- video completed');
  //   // }).catch(err => {
  //   // console.log(err);
  //   // });
  // }
  // closePlayer() {
  //   this.videoPlayer.close();
  // }

}

