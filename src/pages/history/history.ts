import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { GlobalVars } from '../providers/globalVars';
import * as moment from 'moment';
/*
  Generated class for the History page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
declare var cordova:any;
@Component({
  selector: 'page-history',
  templateUrl: 'history.html'
})
export class HistoryPage {
  historyArray : Array<Object> = [];
  donePercent:number;
  constructor(public navCtrl: NavController, public navParams: NavParams, public plt: Platform) {

    this.plt = plt;
    
  }

  ionViewDidLoad(){
      console.log("history page ionDidViewLoad");
      var i:number;
      this.donePercent = 0;
      for(i = GlobalVars.history.length-1; i >= 0 ; i--){
        let historyTime = moment(new Date(GlobalVars.history[i].time));
        let historyElement = {
            day: historyTime.format("dddd, MMM D"),
            time: historyTime.format("h:mma"),
            done: GlobalVars.history[i].done
        };
        if(GlobalVars.history[i].done == 1){
          this.donePercent ++;
        }
        this.historyArray.push(historyElement);
      }
      console.log("historyArray = " + JSON.stringify(this.historyArray))
      if(GlobalVars.history.length != 0){
        this.donePercent = Math.round(this.donePercent * 100 / GlobalVars.history.length);
      }
      else this.donePercent = 0;   
  }
}
