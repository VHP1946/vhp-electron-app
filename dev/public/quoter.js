const $=require('jquery');
var {ipcRenderer}=require('electron');

var RROOT='../bin/repo/';
var Titlebar=require('../bin/repo/gui/js/modules/vg-titlebar.js');
var floatv = require('../bin/repo/gui/js/modules/vg-floatviews.js');

//layouts
var {stdbook}=require('../bin/repo/gui/js/layouts/vg-stdbook.js');
var vcontrol = require('../bin/repo/gui/js/layouts/view-controller.js');
var gentable=require('../bin/repo/gui/js/modules/vg-tables.js');
var domtools=require('../bin/repo/gui/js/tools/vg-displaytools.js');

//tools
var {ObjList}=require('../bin/repo/tools/box/vg-lists.js');
var {DropNote}=require('../bin/repo/gui/js/modules/vg-dropnote.js');
var {VersionDialog,Dialog}=require('../bin/repo/gui/js/modules/vg-dialog.js');
var {deepEqual}=require('../bin/repo/tools/box/vg-gentools.js');

// Module Setup ////////////////////////////////////////////////////////////////
var custbuild = require('../bin/gui/quoter/rrq-buildinfo.js');
var modbuild = require('../bin/gui/quoter/rrq-buildmods.js');
var sumbuild = require('../bin/gui/quoter/rrq-buildsummary.js');
var sysbuild = require('../bin/gui/quoter/rrq-buildsys.js');
var pricer = require('../bin/back/rrq-pricer.js');
////////////////////////////////////////////////////////////////////////////////

var {quotesls}=require('../bin/gui/storage/lstore.js');
var {quoteroutes,navroutes,settingsroutes,actroutes}=require('../bin/routes.js');

var blddom={
  cont:'vg-stdbook-pages',
  nav:{
    sidebar: "vg-stdbook-cont-sidenav",
    sidebuttons: "vg-stdbook-cont-sidenav-button",
    sidebuttonsele: "vg-stdbook-cont-sidenav-button-selected",
    right: "vg-stdbook-cont-sidenav-right",
    left: "vg-stdbook-cont-sidenav-left",
    viewbuttons:{
      info:'rrq-info-button',
      systems:'rrq-systems-button',
      accessories:'rrq-accessories-button',
      summary:'rrq-summary-button'
    }
  },
  pages:{
    cont:'vg-stdbook-pages',
    views:{
      info:'rrq-build-info',
      systems:'rrq-build-systems',
      accessories:'rrq-build-accessories',
      summary:'rrq-build-summary'
    }
  }
}

// Quote Setup //////////////////////////////////////////////////////////////////
var tquote = JSON.parse(localStorage.getItem(quotesls.quotetoload)); //get quote to load from localStorage
console.log('QUOTE: ',tquote);

localStorage.setItem(quotesls.lastquote,JSON.stringify({id:tquote.id,name:tquote.name}));

var qsettings=null;
ipcRenderer.send(settingsroutes.getappsettings,'Initial');
ipcRenderer.on(settingsroutes.getappsettings,(eve,data)=>{
  if(data){
    qsettings = data.quotesettings;
    INITdroplists(data);
    pricer.INITpricer(qsettings);
    custbuild.INITinfobuild(data);
    modbuild.INITmodbuild(qsettings);
    sumbuild.INITsumbuild(qsettings);
    sysbuild.INITsysbuild(qsettings);
    
  }
});

var INITdroplists=(settings)=>{
  domtools.SETdatalistFROMobject(tquote.info.key.groups,'system-groups-list');
  domtools.SETdatalistFROMobject(settings.quotesettings.progress.quotes,custbuild.bidom.quote.status);
  var droplist = {
    source:[],
    lead:[],
    time:[],
    prstvia:[],
  }
  for(let d in droplist){  // set dropdowns for all tracking options
    domtools.SETdatalistFROMobject(settings.reporting[d],custbuild.bidom.quote.tracking[d]);
  }
  for(let ea in settings.quotesettings.utilinfo){  // set dropdown options for utility company selections
    domtools.SETdatalistFROMobject(settings.quotesettings.utilinfo[ea],custbuild.bidom.quote.siteinfo[ea]);
  }
}

// Page Setup //////////////////////////////////////////////////////////////////
var qbook = new stdbook(blddom.pages.views,blddom.nav);

let mactions={
  delete:{
    id:'delete-quote',
    src:'../bin/repo/assets/icons/trash.png',
    title: 'Delete Quote',
    ondblclick:(ele)=>{deleting.SHOWdialog();}
  },
  refresh:{
    id:'refresh-quotekey',
    src:'../bin/repo/assets/icons/key.png',
    title: 'Refresh Price Key',
    ondblclick:(ele)=>{
      if(chcknewkey){
        ipcRenderer.send(quoteroutes.refreshquotekey,'Refresh Quote Key...');
        chcknewkey = false;
      }else{DropNote('tr','...Currently Loading Key','yellow')}
    }
  },
  /*
  pricer:{
    id:'refresh-key',
    src:'../bin/repo/assets/icons/dollar-thin.png',
    title: 'Refresh Quote Pricing',
    ondblclick:(ele)=>{
      tquote.info.systems = sysbuild.GETsystems();
    }
  },
  */
  qfolder:{
    id:'open-quote-folder',
    src:'../bin/repo/assets/icons/folder.png',
    title:'Open Quote Folder',
    ondblclick:(ele)=>{
      DropNote('tr','Opening Folder','green');
      ipcRenderer.send('open-folder',tquote.froot);
    }
  },
  info:{
    id:'version-info',
    src:'../bin/repo/assets/icons/info.png',
    title:'Show version info',
    ondblclick:(ele)=>{
      ipcRenderer.send(actroutes.getver,'Retrieve Version Info');
    }
  }
}

let qactions={
  save:{
    id:'save-quote',
    src:'../bin/repo/assets/icons/disk.png',
    title: 'Save Quote',
    ondblclick:(ele)=>{
      if(chcksavequote){
        SAVEquote();
        chcksavequote=false;
      }else{DropNote('tr','...Currently Saving','yellow');}
    }
  }
}

var closeeve=()=>{   // Event that fires when trying to close window
  if(!deepEqual(tquote,JSON.parse(localStorage.getItem(quotesls.quotetoload)))){
    floatv.SELECTview(document.getElementById('quote-popview'),'CLOSE WARNING');
  }else{
    localStorage.toRefresh = true;
    window.close();
  }
}

Titlebar.SETUPtitlebar(qactions,mactions,closeeve);
$(document.getElementById(Titlebar.tbdom.info.cont)).hide();
$(document.getElementById(Titlebar.tbdom.page.settings)).hide();

var deleting = new Dialog('delete','DELETE WARNING','Are you sure you would like to delete this quote?',['Yes','No']);
deleting.actions.Yes.addEventListener('click',(ele)=>{
  if(chckdeletequote){
    DropNote('tr','Deleting','green');
    ipcRenderer.send(quoteroutes.deletequote,tquote.id);
    chckdeletequote = false;
  }else{DropNote('tr','...Currently Deleting','yellow');}
});
deleting.actions.No.addEventListener('click',(ele)=>{
  document.getElementById('vg-float-frame-close').click();
});

var closing = new Dialog('close','CLOSE WARNING','Changes have been made. <br> Would you like to Save before Closing?',['Yes','No','Cancel']);
closing.actions.Yes.addEventListener('click',(ele)=>{
  if(chcksavequote){
    SAVEquote();
    chcksavequote=false;
  }else{DropNote('tr','...Currently Saving','yellow');}
  localStorage.toRefresh = true;
  window.close();
});
closing.actions.No.addEventListener('click',(ele)=>{
  window.close();
});
closing.actions.Cancel.addEventListener('click',(ele)=>{
  document.getElementById('vg-float-frame-close').click();
});

var version = new VersionDialog(require('../package.json'));

// WORKING VARIABLES //
var chckcreatecontract = true;
var chckdeletequote = true;
var chcksavequote = true;
var chcknewkey = true;
///////////////////////

ipcRenderer.on(quoteroutes.refreshquotekey,(eve,data)=>{
  chcknewkey = true;
  if(data.key && data.key!=undefined){
    DropNote('tr',data.msg,'green');
    console.log(data)
    tquote.info.key = data.key;
    console.log('QUOTE ',tquote);
  }else{DropNote('tr',data.msg,'red')}
});
ipcRenderer.on(quoteroutes.deletequote,(eve,data)=>{
  chckdeletequote = true;
  if(data.status){
    localStorage.toRefresh = true;
    window.close();
  }
  else{DropNote('tr',data.msg,'red');}
});
ipcRenderer.on(quoteroutes.savequote,(eve,data)=>{
  chcksavequote = true;
  if(data.quote&&data.quote!=undefined){
    tquote = data.quote;
    console.log('QUOTE ',tquote);
    DropNote('tr',data.msg,'green');
  }else{DropNote('tr',data.msg,'red')}
});
ipcRenderer.on(quoteroutes.createcontract,(eve,data)=>{
  if(data.status){
    if(data.quote&&data.quote!=undefined){
      tquote = data.quote; //to update the contract object
      SAVEquote();
    }
    DropNote('tr',data.msg,'green');
  }
  else{DropNote('tr',data.msg,'red'),true}
  chckcreatecontract = true;
});
ipcRenderer.on(actroutes.getver,(eve,data)=>{
  let currentpbversion = {
    desc: 'Price Book (most current)',
    date: data.verinfo.pbdate,
    version: data.verinfo.pbver
  };
  let storedpbversion = {
    desc: 'Price Book (in quote)',
    date: tquote.info.key.date,
    version: tquote.info.key.version
  };
  version.SHOWverinfo([currentpbversion,storedpbversion]);
});
ipcRenderer.on(navroutes.gotopresi,(eve,data)=>{
  if(data.quote && data.quote!=undefined){
    DropNote('tr',data.msg,'green');
  }else{
    DropNote('tr',data.msg,'yellow');
  }
  document.getElementById('rrq-create-presentation').addEventListener('click',GOTOpresi);
  document.getElementById('rrq-create-presentation').classList.remove('disabled-button');
});

document.getElementById('rrq-create-presentation').addEventListener('click',GOTOpresi);
 
function GOTOpresi(){
  document.getElementById('rrq-create-presentation').removeEventListener('click',GOTOpresi);
  document.getElementById('rrq-create-presentation').classList.add('disabled-button');
  localStorage.setItem(quotesls.quotetopresi,JSON.stringify(tquote));
  localStorage.setItem(quotesls.qsettings,JSON.stringify(qsettings));
  ipcRenderer.send(navroutes.gotopresi,{quote:tquote});
}
//////////////////////////////////////////////////

var SAVEquote=()=>{
  sysbuild.GETall();
  localStorage.setItem(quotesls.quotetoload,JSON.stringify(tquote)); //save to localStorage (quotetoload for dev)
  ipcRenderer.send(quoteroutes.savequote,{quote:tquote});//send quote to main
}


