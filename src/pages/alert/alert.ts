import { Component , NgZone } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { SettingPage } from '../setting/setting';
import { HomePage } from '../home/home';
import { HistoryPage } from '../history/history';
import { GlobalVars } from '../providers/globalVars';
import { LocalNotifications, File } from 'ionic-native';
declare var cordova:any;

@Component({
  selector: 'page-home',
  templateUrl: 'alert.html'
})
export class AlertPage {
  historyPage = HistoryPage;
  settingPage  =  SettingPage;
  //notifications: any[] = [];
  paused: number;
  zone = new NgZone({enableLongStackTrace: false});
  timer:any;
  notification:any;
  constructor(public navCtrl: NavController, public plt: Platform) {

    console.log("HomePage constructor");
    this.plt = plt;
    this.paused = GlobalVars.setting.status;
    let now = new Date();
    if(GlobalVars.notificationClick == true){
      this.plt.ready().then(() => {
        let currentTime = now.getTime();
        let endTime = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + "-" + GlobalVars.setting.endTime).getTime();
        let startTimeforToday = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate()  + "-" + GlobalVars.setting.startTime);
        let startTimeforTomorrow = new Date(startTimeforToday.getTime() + 24*3600*1000);
        console.log("tomorrow starting: " + startTimeforTomorrow.toString());
        
        if(currentTime + GlobalVars.setting.interval > endTime){
          //alert("joket: notification cancelAll");
            LocalNotifications.cancelAll().then(() => {    
                this.notification = {
                    id:1,
                    text: "this is workingout time",
                    at: startTimeforTomorrow,
                    every:Math.floor(GlobalVars.setting.interval / 60000),
                    autoClear:false
                };
                LocalNotifications.schedule(this.notification);
                console.log("notification is set :" + JSON.stringify(this.notification));
            });
        }
      });
    }
  }
  
  not(){
    this.plt.ready().then(() =>{
        const fs:string = cordova.file.dataDirectory;
        console.log("history file write.");
        var history:any = {
          time:new Date(GlobalVars.notificationAt).toString(),
          done:0
        };
        File.writeFile(fs, 'history.db', JSON.stringify(history)+",", {append: true}).then(data => {
          console.log("history.db saved" + JSON.stringify(history));
        }).catch(err=>{
          console.log("joket: history write error");
        });
        GlobalVars.history.push(history);
    });
    clearTimeout(this.timer);
    this.navCtrl.setRoot(HomePage);
  }
  done(){
    this.plt.ready().then(() =>{
        const fs:string = cordova.file.dataDirectory;
        var history:any = {
            time:new Date(GlobalVars.notificationAt).toString(),
            done:1
        };
        File.writeFile(fs, 'history.db', JSON.stringify(history)+",", {append: true}).then(data => {
          console.log("history.db saved" + JSON.stringify(history));
        }).catch(err=>{
          console.log("joket: history write error");
        });
        GlobalVars.history.push(history);
    });
    clearTimeout(this.timer); 
    this.navCtrl.setRoot(HomePage);
  }
  changeStatus(){
    if(this.paused == 1){
      this.paused = 2;
      GlobalVars.setting.status = 2;
      this.plt.ready().then(() => {           
          const fs:string = cordova.file.dataDirectory;        
          File.removeFile(fs,"settings.db").then(data1=>{
              File.writeFile(fs, 'settings.db', JSON.stringify(GlobalVars.setting), {append: false}).then(data => {
              console.log("settings.db saved" + JSON.stringify(GlobalVars.setting));
              }).catch(err=>{
                  console.log("joket: settings.db save error"+ JSON.stringify(err));
              });
          }).catch(err=>{
              console.log("joket: settings.db remove error" + JSON.stringify(err));
          });
          LocalNotifications.cancelAll().then(() => {
          }).catch(err=>{
            console.log("joket: notification cancel error:"+ JSON.stringify(err));
          });
      });
      clearTimeout(this.timer);
      this.navCtrl.setRoot(HomePage);
    }else if(this.paused == 2){
      this.paused = 1;
      GlobalVars.setting.status = 1;
      let now = new Date();
      let currentTime = now.getTime();
      let startTime = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + "-" + GlobalVars.setting.startTime);
      let endTime = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + "-" + GlobalVars.setting.endTime);
      //add notification
      
      let alertTime = new Date((GlobalVars.setting.interval - (currentTime - startTime.getTime()) % GlobalVars.setting.interval) + currentTime );
      /*var i:number;
      var notification_id:number;
      notification_id = 0;
      for(i = alertTime.getTime(); i < endTime.getTime(); i+= GlobalVars.setting.interval){
          notification_id++;
          let notification={
              id:notification_id,
              text: "this is workingout time",
              at: new Date(i)
          }
          this.notifications.push(notification);
      }*/
      this.notification= {
        id:1,
        text: "this is workingout time",
        firstAt:alertTime,
        every:Math.floor(GlobalVars.setting.interval / 60000)
      }
      this.plt.ready().then(() => {
            const fs:string = cordova.file.dataDirectory;
            File.removeFile(fs,"settings.db").then(data1=>{
              File.writeFile(fs, 'settings.db', JSON.stringify(GlobalVars.setting), {append: false}).then(data => {
              console.log("settings.db saved" + JSON.stringify(GlobalVars.setting));
              }).catch(err=>{
                  console.log("joket: settings.db save error"+ JSON.stringify(err));
              });
          }).catch(err=>{
              console.log("joket: settings.db remove error" + JSON.stringify(err));
          });
          LocalNotifications.cancelAll().then(() => {
              LocalNotifications.schedule(this.notification);
              this.navCtrl.setRoot(HomePage);
          }).catch(err=>{
              console.log("joket: notification cancel error:"+ JSON.stringify(err));
          });
          clearTimeout(this.timer);
          this.navCtrl.setRoot(HomePage);     
      });   
    }
  }
  ionViewDidLoad(){
    //alert("joket ionViewDidLoad");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      let now = new Date();
      var currentTime:number;
      currentTime = now.getTime();
          const fs:string = cordova.file.dataDirectory;
          console.log("AlertPage:history file write.");
          var history:any = {
            time:new Date(GlobalVars.notificationAt).toString(),
            done:0
          };
          //alert("joket");
          File.writeFile(fs, 'history.db', JSON.stringify(history)+",", {append: true}).then(data => {
            console.log("AlertPage:history.db saved" + JSON.stringify(history));
          }).catch(err=>{
            console.log("joket:missing history save error");              
          });
          clearTimeout(this.timer);
          this.navCtrl.setRoot(HomePage);
                         

    },300000);
  }
  
}
