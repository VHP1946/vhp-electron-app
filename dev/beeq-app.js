/**
 * 
 */

const  path = require('path'),
       fs = require('fs'),
       reader = require('xlsx'),
       {exec} = require('child_process');

var {viewtools,app,ipcMain} = require('./app/electronviewtool.js');

var {loginroutes}=require('./bin/repo/gui/js/modules/login.js');
var {navroutes,settingsroutes,dashroutes,quoteroutes}=require('./bin/routes.js');

//Init App
var {Tapp,appproc} = require('./bin/appprocess.js');
var AppControls=require('./app/appcontrols.js');

//Setup Views
var mainv; //holds the main BrowserWindow

let appcontrol = new AppControls({
  stdheight:1080,
  stdwidth:750,
  controlsroot:path.join(__dirname,'/controllers/'),

  pages:{
    ['login/']:{
      page:'index.html',
      logout:()=>{
        return new Promise((resolve,reject)=>{
          Tapp.auser.RESETappuser();
          appproc.GOTOlogin().then(answr=>{
            console.log(answr);
            return resolve(true);
          })
        });
      }
    },
    ['settings/']:{
      page:'index.html'
    },
    dash:{
      page:'.html'
    },
    beeqbuild:{
      page:'.html'
    },
    ['presentation/']:{
      page:'index.html',
      setuppres:()=>{
        
      }
    }
  }
});

//move this somewhere else
ipcMain.on('open-folder',(eve,data)=>{exec(`start "" "${path.join(Tapp.auser.cuser.spdrive,data).replace(/\\/g,'\\\\')}"`);}); //move to utility file

/* LANDING PAGE
    The landing page will more often be the login screen
    This login screen can be skipped by editing the
    appset.dev.on = true. This will default to main.html
    If the developer wants to skip to a page, the
    appset.dev.page can have a desired page file
    name
*/
app.on('ready',(eve)=>{
  let page = Tapp.ONready(eve);//start app from AppConfig
  if(page.page === 'login/'){ //user needs to login
    //put app specific logout prep here
    appcontrol.load({
      fpath:appcontrol.controlsroot + `${page.page}index.html`
    });
  }else{//valid user
    //put app specif config here
    appcontrol.load({
      fpath:appcontrol.controlsroot + `${page.page!=undefined?page.page:'main'}.html`
    });
  }

  mainv.on('close',(eve)=>{
    appproc.ONclose(app);
  });
});

//function to route pages
ipcMain.on('GOTO',appcontrol.SERVEpage);


/** APP login
*    data:{
*      user:'',
*     pswrd:''
*   }
*
*    Recieve a user name and password from login form AND
*    attach the application auth code to it. The api is
*    queried to check both the auth code and the user
*    credentials.
*
*    If the access/login to the api is a success, the
*    appset.users is checked for a match to the user name.
*
*    If the user is found in appset.users, that users group
*    view (appset.groups.main) 'dash' is loaded
*
*
*    user setup function ->>
*    {
*      quotedb.mart.SYNCFROMmaster({estimator:au.auser.uname=='MAN'?undefined:au.auser.uname}).then(
*        (answr)=>{
*          viewtools.swapper(mainv,controlsroot + appset.groups[au.auser.config.group].main,stdwidth,stdheight);
*        }
*      );
*    }
*/
ipcMain.on(Tapp.auser.ROUTElogin,Tapp.auser.LOGINuser);

ipcMain.on(Tapp.ROUTEsettings,Tapp.GETsettings);


/*
ipcMain.on(navroutes.gotopresi,(eve,data)=>{
  let answr = appproc.GOTOpresentation(eve,data);
  if(answr.load){
    viewtools.loader(controlsroot + 'presentation.html',stdwidth,stdheight,false,false,'hidden');
  }
  eve.sender.send(navroutes.gotopresi,answr);
});

ipcMain.on(quoteroutes.refreshquotekey,(eve,data)=>{eve.sender.send(quoteroutes.refreshquotekey,appproc.GETkey(eve,data));});
ipcMain.on(settingsroutes.createkey,(eve,data)=>{eve.sender.send(settingsroutes.createkey,appproc.CREATEkey(eve,data));});

ipcMain.on(dashroutes.createquote,(eve,data)=>{appproc.CREATEquote(eve,data).then(answr=>{
  eve.sender(dashroutes.createquote,answr);
})});
ipcMain.on(quoteroutes.savequote,(eve,data)=>{appproc.SAVEquote(eve,data).then(answr=>{
  eve.sender(quoteroutes.savequote,answr);
})});
ipcMain.on(quoteroutes.deletequote,(eve,data)=>{appproc.DELETEquote(eve,data).then(answr=>{
  eve.sender(quoteroutes.deletequote,answr);
})});
ipcMain.on(dashroutes.getquote,(eve,data)=>{appproc.FINDquote(eve,data).then(answr=>{
  eve.sender.send(dashroutes.getquote,answr);
})});
ipcMain.on(dashroutes.loadquote,(eve,data)=>{
  answr = appproc.LOADquote(eve,data);
  viewtools.loader(controlsroot+'quoter.html',stdwidth,stdheight,false,false,'hidden');
  eve.sender.send(dashroutes.loadquote,answr);
});
ipcMain.on(dashroutes.getuserquotes,(eve,data)=>{appproc.GETuserquotes(eve,data).then(answr=>{
    eve.sender.send(dashroutes.getuserquotes,answr);
})});
ipcMain.on(quoteroutes.syncquotesmaster,(eve,data)=>{appproc.SYNCquotes(eve,data).then(answr=>{
    eve.sender.send(quoteroutes.syncquotesmaster,answr);
})});

ipcMain.on(quoteroutes.createcontract,(eve,data)=>{appproc.CREATEcontract(eve,data).then(answr=>{
    eve.sender.send(quoteroutes.createcontract,answr);
})});

ipcMain.on(quoteroutes.createpresentation,(eve,data)=>{eve.sender.send(quoteroutes.createpresentation,appproc.CREATEpresentation(eve,data));});

ipcMain.on(quoteroutes.sellquote,(eve,data)=>{appproc.SELLquote(eve,data).then(answr=>{
    eve.sender.send(quoteroutes.sellquote,answr);
})});
*/