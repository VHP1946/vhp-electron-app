
const path = require('path');
const fs = require('fs');
const {LocalMart} = require('./LocalStore.js');

//
var apppaths = require('../../app/paths.json');
console.log(apppaths);

var spdbroot = path.join(apppaths.deproot,apppaths.store.root);
console.log(apppaths.deproot);
var spquotes = '/quotes/';
var mquotefilename=apppaths.store.mquotes;

var pricekeyfilename=apppaths.pricing.key;

// User Storage Paths ///////////////////////////////////////////
var cuserroot = 'C:/IMDB/'
var rrqlocalroot = cuserroot + '/beeq/';

var uquotefilename='userquotes.db';
/////////////////////////////////////////////////////////////////

// Setup User Storage Settings //////////////////////////////////
var ustoresettings;
try{
fs.mkdirSync(cuserroot);
}catch{}
try{
  fs.mkdirSync(rrqlocalroot);
}catch{}
try{//try to get the file
  ustoresettings = require(rrqlocalroot+'appstoresettings.json');
}catch{//create the file
  ustoresettings = {
    cansync:true, //user allowed to sync to master
    needsync:false, //user needs to sync to master
    connected:true //user has internet connection
  }
  fs.writeFileSync(rrqlocalroot+'appstoresettings.json',JSON.stringify(ustoresettings));
}
/////////////////////////////////////////////////////////////////


//MOVE into own file ///////////////
/* Saves the price key to file
*/
var SavePriceKey=(key,spdrive)=>{
  fs.writeFileSync(path.join(spdrive,spdbroot,pricekeyfilename),JSON.stringify({
    date:Date(),
    key:key
  }));
}
var GetPriceKey=(spdrive)=>{
  console.log(path.join(spdrive,spdbroot,pricekeyfilename))
  try{
    return require(path.join(spdrive,spdbroot,pricekeyfilename));
  }catch{return null;}
}
////////////////////////////////////




//saves any settings to appstoresettings.json
//move into appuser.js
var SaveUStoreSettings=()=>{
  fs.writeFileSync(rrqlocalroot+'appstoresettings.json',JSON.stringify(ustoresettings));
}

console.log(ustoresettings)

module.exports={
  ustoresettings,
  SaveUStoreSettings,
  SavePriceKey,
  mart:new LocalMart({
    vapihpack:{
        db:"Replacement",
        collect:"Quotes"
    },
    locstore:{
        folder:'/beeq/',
        file:'userquotes.db',
        ensure:{
            fieldName:'id',
            unique:true
        }
    },
    apiargs:{
        core:{
            auth:{user:'VOGCH',pswrd:'vogel123'},
            client:false,
            dev:{
                https:true,
                comments:false
            }
        }
    }
  }),
  GetPriceKey
}
