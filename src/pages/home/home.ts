import { Component, NgZone } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { SettingPage } from '../setting/setting';
import { HistoryPage } from '../history/history';
import { GlobalVars } from '../providers/globalVars';
import { LocalNotifications, File } from 'ionic-native';
import { AlertPage } from '../alert/alert';

declare var cordova:any;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  historyPage = HistoryPage;
  settingPage  =  SettingPage;
  alertPage = AlertPage;
  timeReminder : string;
  paused: number; // pause == GlobalVars.setting.status
  zone = new NgZone({enableLongStackTrace: false});
  timer:any;
  //notifications  : any[] = [];
  notification:any;
  constructor(public navCtrl: NavController, public plt: Platform) {
     
    console.log("HomePage constructor");
    this.plt = plt;
    this.timeReminder = "";
    this.paused = GlobalVars.setting.status;
    GlobalVars.startFromHome = true;
  }
  ionViewDidLoad(){
    
    clearInterval(this.timer);
    //alert("didviewload")
    if(GlobalVars.setting.status == 0){
        this.timeReminder = "No Reminders"
        
    }
    else if(GlobalVars.setting.status == 1){
      let now = new Date();
      let currentTime = now.getTime();
      let startTime = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate()  + "-" + GlobalVars.setting.startTime).getTime();
      if(currentTime <= startTime){
        this.timeReminder = "No Reminders - All Done";
      }
      else{
        let waitTime = Math.round((GlobalVars.setting.interval - ((currentTime - startTime) % GlobalVars.setting.interval)) / 1000 );
        if ( waitTime >= 3600){
            if( Math.floor(waitTime / 3600) > 1)
            this.timeReminder = Math.floor(waitTime / 3600) + "hrs, " + Math.floor(waitTime /60) % 60 + "mins";
            else this.timeReminder = Math.floor(waitTime / 3600) + "hr, " + Math.floor(waitTime /60) % 60 + "mins";
        }
        else if(waitTime >= 60){
            if(Math.floor(waitTime /60) % 60 > 1)
            this.timeReminder =  Math.floor(waitTime /60) % 60 + "mins";
            else this.timeReminder =  Math.floor(waitTime /60) % 60 + "min";        
        }
        else{
            this.timeReminder = waitTime % 60 + "secs";
        }
        var waitTimeForInterval = Math.round((GlobalVars.setting.interval - ((currentTime - startTime) % GlobalVars.setting.interval)) / 1000 );
        var nextNotificationForInterval = currentTime + (GlobalVars.setting.interval - ((currentTime - startTime) % GlobalVars.setting.interval));

        this.timer = setInterval(() => {
          
          if(GlobalVars.setting.status == 2){
            this.timeReminder = "Paused";
            clearInterval(this.timer);
          }
          else{
            waitTimeForInterval -= 1;
            if(waitTimeForInterval <= 0){
              GlobalVars.notificationAt = nextNotificationForInterval;
              nextNotificationForInterval += GlobalVars.setting.interval;
              waitTimeForInterval += GlobalVars.setting.interval / 1000;
              //alert("joket:waitTimeForInterval = "+waitTimeForInterval);
              clearInterval(this.timer);
              this.navCtrl.setRoot(AlertPage);
            }
            else if ( waitTimeForInterval >= 3600){
                if( Math.floor(waitTimeForInterval / 3600) > 1)
                  this.timeReminder = Math.floor(waitTimeForInterval / 3600) + "hrs, " + Math.floor(waitTimeForInterval /60) % 60 + "mins";
                else 
                this.timeReminder = Math.floor(waitTimeForInterval / 3600) + "hr, " + Math.floor(waitTimeForInterval /60) % 60 + "mins";
            }
            else if(waitTimeForInterval >= 60){
                if(Math.floor(waitTimeForInterval /60) % 60 > 1)
                  this.timeReminder =  Math.floor(waitTimeForInterval /60) % 60 + "mins";
                else this.timeReminder =  Math.floor(waitTimeForInterval /60) % 60 + "min";
            }
            else {
                this.timeReminder = waitTimeForInterval % 60 + "secs";
            }
          }

        },1000);
      }
    }
    else{
      this.timeReminder = "Paused";
    }
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
          this.timeReminder = "Paused";
          clearInterval(this.timer);
      });
    }else if(this.paused == 2){
      this.paused = 1;
      GlobalVars.setting.status = 1;
      let now = new Date();
      let currentTime = now.getTime();
      let startTime = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + "-" + GlobalVars.setting.startTime).getTime();
      //let endTime = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + "-" + GlobalVars.setting.endTime);
      let alertTime = new Date((GlobalVars.setting.interval - (currentTime - startTime) % GlobalVars.setting.interval) + currentTime );
      
      //add notification
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
      this.notification = {
        id:1,
        text: "this is workingout time",
        firstAt:alertTime,
        every:Math.floor(GlobalVars.setting.interval / 60 / 1000)
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
                
      });

    }
  }

}
