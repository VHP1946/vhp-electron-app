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
      userfile:path.join(this.fx.lsroot,'userset.json')
    });
    //loop though mart, setup marts *NOT STARTED*
    this.store = {};
    for(let m in mart){
      this.store[m]=new AppMart({
        ...mart[m],
        root:this.fx.approot
      });
    }

    this.controls = new AppViews(controls);

    this.routes = [];
    this.setupRoutes({
      store:(eve,data)=>{
        console.log('Request to mart',data);
        if(this.store[data.store]){
          this.store[data.store].ROUTEstore(data.pack).then(answr=>{
            console.log('End of Routes ',answr);
            eve.sender.send('store',answr);
          });
        }else{eve.sender.send('store',{success:false,msg:'Store doesnt exists!',result:[]})}
      },
      ...routes,
      ...this.fx.routes
    });

    this.app.on('ready',(eve)=>{
      console.log('app ready')
      this.controls.main({appclose:(eve)=>{this.app.exit();}})
    })
  }

  setupRoutes(routes){
    this.ipcMain.on('GOTO',this.controls.page);
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
        this.ipcMain.on(r,addroutes[r]);
        this.routes.push(r);
      }
    }
  }

  /** Login Application User
   *  
   *  takes in user information and saves it to
   *  the users local app files. It can be used
   *  as a login as it returns false if it can not
   *  verify the user against the user list.
   * 
   * @todo better define the return pack.user (should
   *       be the user config information).
   * @todo have ONusersetup be return a promise. It may
   *       be handy for later applicatoin 
   * 
   * @param {Array} users 
   * @param {String} uname 
   * @param {String} pswrd
   * @param {Function} ONusersetup -> function passed to run if valid user
   * @returns {status:Boolean, msg:String, user:{au.auser.config}}
   */
  login(eve,{
    name='',
    password=''
  }){
    let route = 'login';
    let rpak = {
        success:false,
        msg:'',
        user:null
    }
    //get old user data to compare after login
    if(this.user.AUTHappuser(name,password)){
        rpak.success=true;
        rpak.msg = 'User is Logged in';
        rpak.user=this.user;
        //if new user, clean mart of old user data
        //if cleaned, refresh mart with new user data?
    }else{
        rpak.msg='User login failed'
    }
    eve.sender.send(route,rpak)
  }
}