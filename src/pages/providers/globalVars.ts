
export class GlobalVars {
    
    static history : Array<any> = [];

    static setting: {
            startTime ?: string;
            endTime ?:string;
            interval ?: number;
            status ?:number;// 0: false 1:normal 2:pause
          };
    static notificationAt:number;
    static notificationClick:boolean;
    static startFromHome:boolean;
}
