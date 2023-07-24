const $ = require('jquery'),
    path = require('path');
var {ipcRenderer} = require('electron');

var {settingsroutes,navroutes,actroutes,qdashroutes,quoteroutes} = require('../bin/routes.js'); //Routes to Main Process

var RROOT = '../bin/repo/';
var Titlebar = require('../bin/repo/gui/js/modules/vg-titlebar.js');
var gentable = require('../bin/repo/gui/js/modules/vg-tables.js');
var floatv = require('../bin/repo/gui/js/modules/vg-floatviews.js');
var {DropNote} = require('../bin/repo/gui/js/modules/vg-dropnote.js');
const {SORTlist} = require('../bin/repo/tools/box/vg-gentools.js');
var vcontrol = require('../bin/repo/gui/js/layouts/view-controller.js');
var {VersionDialog,Dialog} = require('../bin/repo/gui/js/modules/vg-dialog.js');

var {ObjList} = require('../bin/repo/tools/box/vg-lists.js');
var gendis = require('../bin/repo/gui/js/tools/vg-displaytools.js');

var apppaths = require('../app/paths.json');
var au = require('../bin/appuser.js'); //initialize the app user object
var appsettpath = path.join(au.auser.cuser.spdrive,apppaths.deproot,apppaths.settings);

var {usersls,quotesls} = require('../bin/gui/storage/lstore.js');
var converter = require('../bin/back/converter.js');

var quotedb = require('../bin/db/dbsetup.js');

var appset = require(appsettpath);
var uquotes = new ObjList();
var quoteset = null;
var currquote = {};
var toloadquote = false; //when "getting" quote FALSE(does not load quoter) TRUE(does load quoter)

var quotefloat = document.getElementById('quote-center');

localStorage.toRefresh = false;

var sortopt = 'opendate';
var sortorder = -1;
var currtab = 0;

var qddom={
  cont:'quote-tables-container',
  actions:{
    createnewquote:'quote-action-createnewquote',
    resumelastquote:'quote-action-resumelastquote'
  },
  tables:{
    cont:'quote-tables-container',
    row:'quote-table-row'
  }
}

var predom={
  cont:'vg-center-info-preview',
  client:{
    name:'preview-value-cname',
    jaddy:'preview-value-jaddy',
    phone1:'preview-value-phone1',
    email:'preview-value-email'
  },
  status:'preview-value-status',
  created:'preview-value-created',
  saved:'preview-value-saved',
  buttons:{
    open:'open-cur-quote',
    close:'close-preview',
    sell:'sell-cur-quote'
  }
}

var newdom={
  cont:'vg-center-info-newquote',
  quote:'newquote-quotename',
  client:{
    name:'newquote-clientname',
    phone:'newquote-clientphone',
    email:'newquote-clientemail'
  },
  button:'submit-new-quote'
}

// Initialize localStorage /////////////////////////////////////////////////////
try{
  let ql = JSON.parse(localStorage.getItem(quotesls.lastquote));
  if(ql.id==undefined){localStorage.setItem(quotesls.lastquote,JSON.stringify({id:'',name:''}))}
}catch{}
////////////////////////////////////////////////////////////////////////////////

ipcRenderer.send(settingsroutes.getquotesets,"Request quote settings"); //Request quote settings
ipcRenderer.send(qdashroutes.getuserquotes,"Requesting quote list...");//request user list

//  TITLE BAR //
try{
  var userinfo = JSON.parse(localStorage.getItem(usersls.curruser))
  document.getElementById(Titlebar.tbdom.info.username).innerText = userinfo.uname;
}catch{}

document.getElementById(Titlebar.tbdom.page.user).addEventListener('dblclick',LogOut);

function LogOut(){
  document.getElementById(Titlebar.tbdom.page.user).removeEventListener('dblclick',LogOut);
  ipcRenderer.send(navroutes.gotologin,'Opening Login Dash...');
}

document.getElementById(Titlebar.tbdom.page.settings).addEventListener('dblclick',(eve)=>{//GOTO SETTINGS
  ipcRenderer.send(navroutes.gotosettings,'Open Settings...');
});

let mactions={
  refresh:{
    id:'refresh-dash',
    src:'../bin/repo/assets/icons/refresh-icon.png',
    title:'Refresh Dash',
    ondblclick:(eve)=>{ipcRenderer.send(qdashroutes.getuserquotes,"Refresh Dash...");}
  },
  version:{
    id:'version-info',
    src:'../bin/repo/assets/icons/info.png',
    title:'Show version info',
    ondblclick:(eve)=>{
      ipcRenderer.send(actroutes.getver,'Retrieve Version Info');
      
    }
  }
}

Titlebar.SETUPtitlebar(qactions={},mactions);
Titlebar.ConnectionMonitor(quotedb.mart.vapi);

if(appset.users[userinfo.uname].group=="DEV" || userinfo.uname=='MURRY'){
  $(document.getElementById(Titlebar.tbdom.page.settings)).show();
}else{
  $(document.getElementById(Titlebar.tbdom.page.settings)).hide();
}

var version = new VersionDialog(require('../package.json'));

/////////////////

//  QUOTE TABLE //
var quotetableheads={
  active:{
    id:'ID',
    name:'QUOTE NAME',
    estimator:'CONSULTANT',
    street:'ADDRESS',
    customer:{
      name:'CUSTOMER'
    },
    opendate:'OPEN DATE'
  },
  hold:{
    id:'ID',
    name:'QUOTE NAME',
    estimator:'CONSULTANT',
    street:'ADDRESS',
    customer:{
      name:'CUSTOMER'
    },
    subdate:'SUBMIT DATE'
  },
  submitted:{
    id:'ID',
    name:'QUOTE NAME',
    estimator:'CONSULTANT',
    street:'ADDRESS',
    customer:{
      name:'CUSTOMER'
    },
    apprdate:'APPR DATE'
  },
  archived:{
    id:'ID',
    name:'QUOTE NAME',
    estimator:'CONSULTANT',
    street:'ADDRESS',
    customer:{
      name:'CUSTOMER'
    },
    opendate:'CLOSE DATE'
  }
}
var quotetablemaps={
  active:(r=null)=>{
    if(!r||r==undefined){console.log(r);r={}}
    return{
      id:r.id||'',
      name:r.name||'',
      estimator:r.estimator||'',
      street:r.street||'',
      customer:r.customer!=undefined? r.customer.name||'':'',
      opendate:r.opendate||'',
    }
  },
  hold:(r=null)=>{
    if(!r||r==undefined){console.log(r);r={}}
    return{
      id:r.id||'',
      name:r.name||'',
      estimator:r.estimator||'',
      street:r.street||'',
      customer:r.customer!=undefined? r.customer.name||'':'',
      subdate:r.subdate||'',
    }
  },
  submitted:(r=null)=>{
    if(!r||r==undefined){console.log(r);r={}}
    return{
      id:r.id||'',
      name:r.name||'',
      estimator:r.estimator||'',
      street:r.street||'',
      customer:r.customer!=undefined? r.customer.name||'':'',
      apprdate:r.apprdate||'',
    }
  },
  archived:(r=null)=>{
    if(!r||r==undefined){console.log(r);r={}}
    return{
      id:r.id||'',
      name:r.name||'',
      estimator:r.estimator||'',
      street:r.street||'',
      customer:r.customer!=undefined? r.customer.name||'':'',
      closedate:r.closedate||'',
    }
  }
}
var qtableacts = {
  createnewquote:{
    id:'quote-action-createnewquote',
    src:'../bin/repo/assets/icons/open-new.png'
  },
  resumelastquote:{
    id:'quote-action-resumelastquote',
    src:'../bin/repo/assets/icons/open-last.png'
  }
}

var qtableviews = new vcontrol.ViewGroup({
  cont:document.getElementById(qddom.tables.cont),
  type:'mtl',
  qactions:qtableacts
});

/* Set/Reset the quote TABLES
    Quote tables are based on the quote.status. Appset is used to determine
    the status' to include in the set of tables.
*/
var SETquotetable=()=>{
  let tcont = document.getElementById(qddom.tables.cont);
  qtableviews.CLEARview(tcont);

  for(let s in quoteset.progress.quotes){
    let v = document.createElement('div');
    v = qtableviews.ADDview(quoteset.progress.quotes[s],v);
    v.appendChild(document.createElement('div'));
    v.lastChild.classList.add(gentable.gtdom.table, `${s}-table`);
    FILLquotetable(s);
  }
  qtableviews.buttons.children[currtab].click(); //fires a click event

  gendis.SETdatalistFROMobject(quoteset.progress.quotes,predom.status);
  // fill options
}

var FILLquotetable=(s)=>{
  let v = document.getElementsByClassName(`${s}-table`)[0];
  let l = SORTlist(uquotes.TRIMlist({progress:s}),sortopt,sortorder);
  l = [].concat(quotetableheads[s],l);
  gentable.BUILDtruetable(l,v,true,qddom.tables.row,quotetablemaps[s]);
  let headers = v.getElementsByClassName('vg-gentable-header')[0].children
      for(let i=0;i<headers.length;i++){
        headers[i].addEventListener('click', (ele)=>{
          sortorder = -sortorder;
          sortopt = ele.target.title;
          FILLquotetable(s);
        });
      }
}

window.addEventListener('focus',(eve)=>{
  if(localStorage.toRefresh == 'true'){
    ipcRenderer.send(qdashroutes.getuserquotes,"Refresh Dash...");
  }
});

qtableviews.port.addEventListener('dblclick',(eve)=>{
  if(!eve.target.parentNode.classList.contains('vg-gentable-header')){
    let lrow = gendis.FINDparentele(eve.target,qddom.tables.row);
    if(lrow){
      ipcRenderer.send(qdashroutes.getquote,{id:lrow.children[0].innerText});
    }
  }
});

//  DASH ACTIONS //
document.getElementById(qddom.actions.createnewquote).addEventListener('dblclick',(eve)=>{   //Create New Quote
  floatv.SELECTview(document.getElementById('quote-center'),'New Quote');   //open new quote preview
  document.getElementById(newdom.quote).focus();
});
document.getElementById(qddom.actions.resumelastquote).addEventListener('dblclick',(eve)=>{   //Resume Last Quote
  let lquote = JSON.parse(localStorage.getItem(quotesls.lastquote)).id;
  if(lquote&&lquote!=undefined){
    ipcRenderer.send(qdashroutes.getquote,{id:lquote});
    toloadquote=true;
  }else{
    DropNote('tr','No Quote to Load','red');
  }
});

document.getElementById(newdom.quote).addEventListener('keypress',(eve)=>{
  if(eve.key == 'Enter'){document.getElementById(newdom.button).click();};
});
for(let i in newdom.client){
  document.getElementById(newdom.client[i]).addEventListener('keypress',(eve)=>{
    if(eve.key == 'Enter'){document.getElementById(newdom.button).click();};
  });
}
document.getElementById(newdom.button).addEventListener('click',SubmitNew);
function SubmitNew(){
  document.getElementById(newdom.button).removeEventListener('click',SubmitNew);
  let tempobj = {
    name:document.getElementById(newdom.quote).value,
    customer:{
      name:document.getElementById(newdom.client.name).value!=''?document.getElementById(newdom.client.name).value:'NONAME',
      phone:document.getElementById(newdom.client.phone).value,
      email:document.getElementById(newdom.client.email).value
    }
  };
  ipcRenderer.send(qdashroutes.createquote,tempobj);
  ipcRenderer.send(qdashroutes.getuserquotes,"Refresh Dash...");
}

var convert = new Dialog('data','DATA WARNING','The selected quote uses old data. Please wait until the converter module has been installed.',['Okay']);
convert.actions.Okay.addEventListener('click',(eve)=>{document.getElementById('vg-float-frame-close').click();});

ipcRenderer.on(qdashroutes.getquote,(eve,data)=>{
  if(data.quote && data.quote!=undefined){
    currquote = data.quote;
    if(!converter.CHECKdataversion(currquote)){  // perform check to see if the quote is using an older data structure
      convert.SHOWdialog();
      currquote = converter.CONVERTdata(currquote,quoteset,au.auser.cuser.spdrive);  // if older data structure found, convert to new data structure
    }else{
      DropNote('tr',data.msg,'green');
      localStorage.setItem(quotesls.quotetoload,JSON.stringify(currquote));
      if(toloadquote){
        ipcRenderer.send(qdashroutes.loadquote,{id:currquote.id});
        toloadquote=false;
      }
      else{
        POPpreview();
        floatv.SELECTview(quotefloat,'Preview Quote');
      }
    }
  }else{DropNote('tr',data.msg,'yellow')}
});
ipcRenderer.on(qdashroutes.getuserquotes,(eve,data)=>{
  if(quoteset && data.quotes){
    uquotes.SETlist(data.quotes);
    for(let s in quoteset.progress.quotes){
      FILLquotetable(s);
    }
    localStorage.toRefresh = false;
  }
});
ipcRenderer.on(qdashroutes.loadquote,(eve,data)=>{
  if(data.id){
    DropNote('tr',data.msg,'green');
  }else{DropNote('tr',data.msg,'red');}
});
ipcRenderer.on(qdashroutes.createquote,(eve,data)=>{
  if(data.quote){
    DropNote('tr',data.msg,'green');
    localStorage.setItem(quotesls.quotetoload,JSON.stringify(data.quote));
    ipcRenderer.send(qdashroutes.loadquote,{id:data.quote.id});
    floatv.RESETframe(document.getElementById('quote-center'));
    document.getElementById(newdom.quote).value = '';  // Clear boxes
    for(let x in newdom.client){
      document.getElementById(newdom.client[x]).value='';
    }
  }else{DropNote('tr',data.msg,'red')}
  document.getElementById(newdom.button).addEventListener('click',SubmitNew);
});
ipcRenderer.on(settingsroutes.getquotesets,(eve,data)=>{
  if(data.status!=undefined){
    quoteset = data;
  }
  SETquotetable();
});
ipcRenderer.on(quoteroutes.sellquote,(eve,data)=>{
  if(data.status){
    DropNote('tr',data.msg,'green');
  }else{DropNote('tr',data.msg,'red')}
  document.getElementById(predom.buttons.sell).addEventListener('click',ToSell);
  document.getElementById(predom.buttons.sell).classList.remove('disabled-button');
});
ipcRenderer.on(actroutes.getver,(eve,data)=>{
  let pbversion = {
      desc: 'Price Book',
      date: data.verinfo.pbdate,
      version: data.verinfo.pbver
    };
  version.SHOWverinfo([pbversion]);
  
});

//  Float Views ////////////////////////////////////////////

var POPpreview=()=>{
  document.getElementById('preview-quote-id').innerText = currquote.id;
  document.getElementById(predom.client.name).innerText = currquote.customer.name;
  document.getElementById(predom.client.jaddy).innerText = currquote.street;
  document.getElementById(predom.client.phone1).innerText = currquote.customer.phone;
  document.getElementById(predom.client.email).innerText = currquote.customer.email;
  document.getElementById(predom.status).value = currquote.progress;
  document.getElementById(predom.created).innerText = currquote.opendate.split('T')[0];
  document.getElementById(predom.saved).innerText = currquote.lastdate.split('T')[0];

  if(!currquote.sold){
    document.getElementById(predom.buttons.sell).addEventListener('click',ToSell);
    document.getElementById(predom.buttons.sell).classList.remove('disabled-button');
  }else{
    document.getElementById(predom.buttons.sell).removeEventListener('click',ToSell);
    document.getElementById(predom.buttons.sell).classList.add('disabled-button');
  }
}

document.getElementById(predom.buttons.open).addEventListener('click',(eve)=>{
  let lquote = JSON.parse(localStorage.getItem(quotesls.quotetoload)).id;
  if(lquote&&lquote!=undefined){
    ipcRenderer.send(qdashroutes.getquote,{id:lquote});
    toloadquote=true;
    floatv.RESETframe(quotefloat);
  }else{
    DropNote('tr','No Quote to Load','red');
  }
});

document.getElementById(predom.buttons.sell).addEventListener('click',ToSell);
function ToSell(){
  document.getElementById(predom.buttons.sell).removeEventListener('click',ToSell);
  document.getElementById(predom.buttons.sell).classList.add('disabled-button');
  let lquote = JSON.parse(localStorage.getItem(quotesls.quotetoload));
  if(lquote && lquote!=undefined){ipcRenderer.send(quoteroutes.sellquote,lquote);}
}

document.getElementById(predom.status).addEventListener('change',(eve)=>{
  currquote.progress = document.getElementById(predom.status).value;
  ipcRenderer.send(quoteroutes.savequote,{quote:currquote});
});

ipcRenderer.on(quoteroutes.savequote,(eve,data)=>{
  ipcRenderer.send(qdashroutes.getuserquotes,"Refresh Dash...");
});