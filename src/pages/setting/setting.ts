import { Component, NgZone } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { HomePage } from '../home/home';
import { AlertPage } from '../alert/alert';
import { LocalNotifications, File} from 'ionic-native';
import { GlobalVars } from '../providers/globalVars';
declare var cordova:any;

@Component({
    selector : 'page-setting',
    templateUrl: 'setting.html'
})
export class SettingPage {
    homePage = HomePage;
    timeUnitSelect : string;
    beginTime : string;
    endTime : string;
    timeRange : number;
    startFromHome :number;
    zone = new NgZone({enableLongStackTrace: false});
    notification:any;
    constructor(public navCtrl: NavController, public plt: Platform){
            
        console.log("SettingPage constructor");
         GlobalVars.setting = {
                        interval: 0,
                        startTime:"",
                        endTime:"",
                        status :0// 0: false 1:normal 2:pause
                    }
        this.plt = plt;
        GlobalVars.notificationClick = false;
        if(GlobalVars.notificationClick == false){
            LocalNotifications.on("click", (notification) => {
                GlobalVars.notificationClick = true;
            });
        }
        if(GlobalVars.startFromHome == undefined) this.startFromHome = 0;
        else this.startFromHome = 1;
        this.plt.ready().then(() =>{
            
            const fs:string = cordova.file.dataDirectory;
            console.log("read settings.db file");
            File.readAsText(fs, 'settings.db').then(data => {
                GlobalVars.setting = JSON.parse(data.toString());
                console.log("settings.db loaded " + JSON.stringify(GlobalVars.setting));
                if(GlobalVars.setting.status == 0){
                    
                }
                else if(GlobalVars.setting.status == 1){
                    if(GlobalVars.notificationClick == true){
                        var notificationAt:number;
                        let currentTime = new Date().getTime();
                        notificationAt = currentTime - (currentTime % GlobalVars.setting.interval);
                        if(GlobalVars.notificationAt == undefined){
                            
                            GlobalVars.notificationAt = notificationAt;
                            this.navCtrl.setRoot(AlertPage);
                        }
                        else if(GlobalVars.notificationAt < notificationAt){
                            //
                        }
                        else{
                            this.navCtrl.setRoot(HomePage);
                        }
                    }
                    //missing notification
                    
                    LocalNotifications.getScheduled(1).then(result=>{
                        console.log("scheduled notification = "+JSON.stringify(result));
                        var firstTime;
                        var notifications:Array<any> = [];
                        notifications = JSON.parse(JSON.stringify(result));
                        firstTime = notifications[0].at * 1000;
                        console.log("notification.at = " + new Date(firstTime).toString());
                        //alert("first time = " + firstTime + " notfication = " + JSON.stringify(notifications[0]));
                        File.readAsText(fs, 'history.db').then(data2 => {
                            stringhistory = data2.toString();
                           // console.log("stringhistory = " + stringhistory);
                            stringhistory = stringhistory.substring(0, stringhistory.length - 1);
                            GlobalVars.history = JSON.parse('[' + stringhistory + ']');
                            let lastHistory = new Date(GlobalVars.history[GlobalVars.history.length - 1].time).getTime();
                           // console.log("GlobalVars.history = " + JSON.stringify(GlobalVars.history));
                            if(firstTime == undefined ||firstTime < lastHistory){
                                console.log("first time = last hisotry update firstTime = " + new Date(firstTime).toString() + "lastHistory = " +  new Date(lastHistory).toString());
                                firstTime = lastHistory;
                                
                            }

                            let now = new Date();
                            let currentTime = now.getTime();
                            var i:number;
                            //alert("joket: firstTime " + firstTime);
                            for(i = firstTime + GlobalVars.setting.interval; i < currentTime - 300* 1000; i+= GlobalVars.setting.interval){
                                var history:any = {
                                   time:new Date(i).toString(),
                                   done:0
                                };
                                File.writeFile(fs, 'history.db', JSON.stringify(history)+",", {append: true}).then(data => {
                                    console.log("missing workingout history.db saved" + JSON.stringify(history));
                                }).catch(err=>{
                                    console.log("joket: history write error");
                                });
                                GlobalVars.history.push(history);
                            }

                            let startTime = new Date(now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + "-" + GlobalVars.setting.startTime).getTime();
                            let alertTime = new Date((GlobalVars.setting.interval - (currentTime - startTime) % GlobalVars.setting.interval) + currentTime );
                            this.notification = {
                                id:1,
                                text:"this is workingout time",
                                firstAt:alertTime,
                                every:Math.floor(GlobalVars.setting.interval / 60 / 1000)
                            }
                            if(GlobalVars.startFromHome == undefined) this.navCtrl.setRoot(HomePage);
                            LocalNotifications.cancelAll().then(() => {
                                LocalNotifications.schedule(this.notification);
                            }).catch(err=>{
                                console.log("joket: notification cancel error:"+ JSON.stringify(err));
                            });
                        }).catch(err=>{

                        });
                    }).catch(err=>{
                        
                        alert("joket: please reset notfication");
                    });
                    

                }
                else{
                    if(GlobalVars.startFromHome == undefined) this.navCtrl.setRoot(HomePage);
                }
            
            }).catch(err=>{
                console.log(JSON.stringify(err));
                console.log("file doesn't exist so create it.");
                //File.createDir(fs, "localnotifications", false)
                File.createFile(fs, 'settings.db', true).then(data1 => {
                    console.log("settings.db file created");
                   
                    
                    /*File.writeFile(fs, 'settings.db', JSON.stringify(GlobalVars.setting), {append: false}).then(data => {
                        console.log("settings.db saved" + JSON.stringify(GlobalVars.setting));
                    }).catch(err=>{
                        console.log("joket: settings db file write error");
                    });*/
                }).catch(err=>{
                    console.log("joket:settings.db file create error");
                });
            });
            var stringhistory:string;
            File.readAsText(fs, 'history.db').then(data2 => {
                stringhistory = data2.toString();
                console.log("stringhistory = " + stringhistory);
                stringhistory = stringhistory.substring(0, stringhistory.length - 1);
                GlobalVars.history = JSON.parse('[' + stringhistory + ']');
                console.log("GlobalVars.history = " + JSON.stringify(GlobalVars.history));
            
            }).catch(err=>{
                console.log("file doesn't exist so create it.");
                File.createFile(fs, 'history.db', true).then(data1 => {
                    console.log("history.db file created");
                }).catch(err=>{
                    console.log("joket:history.db file create error");
                });
            });
        });   
           
    }
    ionViewDidLoad(){
        if(GlobalVars.setting.status == 0){
            this.timeUnitSelect = 'h';
            this.beginTime = "00:00";
            this.endTime = "23:59";
            this.timeRange = 1;
            // GlobalVars.history = [];
        }
        else{
            if(GlobalVars.setting.interval >= 60*60*1000) {
                this.timeUnitSelect = 'h';
                this.timeRange = Math.floor(GlobalVars.setting.interval /60/60/1000);
            }
            else{
                this.timeUnitSelect = 'm';
                this.timeRange = Math.floor(GlobalVars.setting.interval /60/1000);
            } 
            this.beginTime =GlobalVars.setting.startTime;
            this.endTime = GlobalVars.setting.endTime;

        }
    }
    ionViewWillEnter(){
        if(GlobalVars.startFromHome == undefined) this.startFromHome = 0;
        else this.startFromHome = 1;
    }
    back(){
        if(this.startFromHome == 1) this.navCtrl.pop();
    }
    startReminding(){
        var cTime = new Date();
        console.log("this.beginTime :"+ this.beginTime);
        let startTime = new Date(cTime.getFullYear() + "-" + (cTime.getMonth()+1) + "-" + cTime.getDate() + "-" + this.beginTime);
        //let endTime = new Date(cTime.getFullYear() + "-" + (cTime.getMonth()+1) + "-" + cTime.getDate() + "-" + this.endTime);
        let currentTime = cTime.getTime();

        //save GlobalVars values
        GlobalVars.setting.startTime = this.beginTime;
        GlobalVars.setting.endTime = this.endTime;
        GlobalVars.setting.status = 1;
        if(this.timeUnitSelect == 'h'){
            GlobalVars.setting.interval = this.timeRange * 60 * 60 * 1000;
        }
        else if(this.timeUnitSelect == 'm'){
            if(this.timeRange < 10) this.timeRange = 10;
            GlobalVars.setting.interval = this.timeRange *60 * 1000;
        }
        let alertTime = new Date((GlobalVars.setting.interval - (currentTime - startTime.getTime()) % GlobalVars.setting.interval) + currentTime );
        //add notifications
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
            this.notifications.push(notification)
        }*/
        this.notification = {
            id:1,
            text:"this is workingout time",
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
