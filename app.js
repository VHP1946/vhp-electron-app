var {app,ipcMain} = require('electron');
/**App Store File
 * 
 * File will handle the applications user and 
 * their local storage. 
 * 
 * @todo bring in login functions
 * @todo create a class to hold config and settings
 * 
 */
const path = require('path');

const AppFX = require('./bin/AppFX.js');
const AppUser = require('./bin/AppUser.js');
const AppViews = require('./bin/AppViews.js');
const AppMart = require('./bin/AppMart.js');

module.exports = class AppManager {
  /** App Manager
   * configs the application
   * - paths
   * - settings
   * - users
   * 
   * It will first read the 'paths.json' file
   * and take direction from there.
   * 
   */
  constructor({
    appname='bin',
    settings={},//outside
    access={},
    controls={},
    mart={},
    routes={}
  }){
    this.app=app;
    this.ipcMain = ipcMain;
    this.settings = settings;//provided settings for application

    this.fx = new AppFX({app:appname});

    this.user = new AppUser({
      ...access,
      userfile:path.join(this.fx.approot,'userset.json')
    });

    //loop though mart, setup marts *NOT STARTED*
    this.store = {};
    for(let m in mart){
      this.store[m]=new AppMart({
        ...mart[m],
        root:this.fx.approot
      });
    }
    console.log('this is new')
    this.controls = new AppViews(controls);

    this.routes = [];
    this.setupRoutes({
      store:(eve,data)=>{
        return new Promise((resolve,reject)=>{
          console.log('Request to mart',data);
          if(this.store[data.store]){
            this.store[data.store].ROUTEstore(data.pack,data.options).then(answr=>{
              // /console.log('End of Routes ',answr);
              return resolve(answr);//eve.sender.send('store',answr);
            });
          }else{return resolve({success:false,msg:'Store doesnt exists!',result:[]});}//eve.sender.send('store',{success:false,msg:'Store doesnt exists!',result:[]})}
        });
      },
      ...routes,
      ...this.fx.routes,
      ...this.user.uRoutes
    });

    this.app.on('ready',(eve)=>{
      console.log('app ready')
      this.controls.main({appclose:(eve)=>{this.app.exit();}})
    })
  }

  setupRoutes(routes){
    this.ipcMain.handle('GOTO',this.controls.page);
    this.ADDroutes(routes);//initialize app custom routes
  }

  /**
   * Pass route list as a dictionary of all the
   * ipcMain.on functions. If the route does not
   * already exist, it is add to ipcMain. Then
   * it is add to this.routes[].
   * @param {Object} routes 
   */
  ADDroutes(addroutes = {}){
    for(let r in addroutes){
      if(!this.routes.includes(r)){
        this.ipcMain.handle(r,addroutes[r]);
        this.routes.push(r);
      }
    }
  }
}