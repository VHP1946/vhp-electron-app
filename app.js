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
        apiconnect={},
		routes={}
	}){
		this.app=app;
        this.appinfo=null;
        try{
            this.appinfo=require(path.join(process.cwd(),'./package.json'))
        }catch{}

		this.isLocked = this.app.requestSingleInstanceLock();
        if(!this.isLocked){this.app.quit();}

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
            let martpack = {
                ...mart[m]
            };
            try{
                if(!mart[m].connection && apiconnect){martpack.connection=apiconnect}
            }catch{}
            this.store[m]=new AppMart({
    			...martpack,
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
		home:this.controls.GOhome,
		logout:(eve,data)=>{
			return new Promise((resolve,reject)=>{
			this.user.RESETuser();
			this.controls.pager({page:'login/'})
			return resolve({success:true,msg:'Has logged out'});
			});
		},
		login:(eve,data)=>{
			return new Promise((resolve,reject)=>{
			console.log('login',this.controls.mainPage)
			if(this.user.AUTHappuser(data.uname,data.pswrd)){
				this.controls.pager({page:this.controls.mainPage});
				return resolve({success:true,msg:'Has Logged in'})
			}else{return resolve({success:false,msg:'Bad Credentials'})}
			})
		},
		...routes,
		...this.fx.routes,
		...this.user.uRoutes
		});


		this.isLocked = this.app.requestSingleInstanceLock();

		if(!this.isLocked){
			this.app.quit()
		}else{
			this.app.on('second-instance', (event, commandLine, workingDirectory, additionalData)=>{
			  console.log('Second Instance Opened');

			  // Someone tried to run a second instance, we should focus our window.
			  if(this.controls.mainv){
				if(this.controls.mainv.isMinimized()){
					this.controls.mainv.restore();
				}
				this.controls.mainv.focus();
			  }
			})

			this.app.whenReady().then(() => {
				this.controls.main({
					appclose:(eve)=>{
						if(this.controls.currpage===this.controls.mainPage || this.controls.currpage==='login/'){this.app.exit();}
						else{
							eve.preventDefault();
							eve.sender.send('page-close');
						}
					}
				})
			})
		}
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
