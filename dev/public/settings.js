var {ipcRenderer}=require('electron');
var $ = require('jquery');

var RROOT = '../bin/repo/';

var domtools = require('../bin/repo/gui/js/tools/vg-displaytools.js');
var vgtables = require('../bin/repo/gui/js/modules/vg-tables.js');
var {DropNote}=require('../bin/repo/gui/js/modules/vg-dropnote.js');
var Titlebar = require('../bin/repo/gui/js/modules/vg-titlebar.js');
var SMView = require('../bin/repo/gui/js/layouts/vg-sidemenuview.js');

var objedit = require('../bin/repo/gui/js/modules/vg-objecteditor.js');
var {settingsroutes}=require('../bin/routes.js');

var adminform=require('../bin/repo/gui/js/forms/vg-adminsettings-form.js');
var userform=require('../bin/repo/gui/js/forms/vg-usersettings-forms.js')
var tierform=require('../bin/gui/forms/rrq-tiersettings-forms.js');

var appsettings=null;

ipcRenderer.send('GET-appsettings','Initial');
ipcRenderer.on('GET-appsettings',(eve,data)=>{
  if(data){
    appsettings = data;
    adminform.SETadminsettings(appsettings);
    userform.SETusersettings(appsettings);
    SETquotesettings(appsettings.quotesettings);
  }
});

SMView.SETmenuitems(document.getElementById('settings-cont'));
SMView.SETmenuitems(document.getElementById('quote-settings')); //sub menu

//  ADMIN  //
document.getElementById(adminform.admdom.cont).addEventListener('change',(ele)=>{
  appsettings=objedit.GETedit(document.getElementById(adminform.admdom.cont));
});
/////////////////////////////

// USER  //
document.getElementById(userform.usedom.cont).addEventListener('change',(ele)=>{
  userform.GETusersettings();
});
/////////////////////////////

//  QUOTE //////////////////////////////////////////////////////////////////////
var quodom={
  cont:'quote-settings',
  discounts:{
    list:'discounts-list'
  },
  finance:{
    list:'finance-list',
    info:{
      code:'finance-code',
      regrate:'finance-regrate',
      promo:'finance-promo',
      term:'finance-term'
    }
  },
  tiers:{
    list:'tier-list',
    form:{
      cont:'tier-form-cont',
      info:{
        code:'tier-form-code',
        name:'tier-form-name',
        color:'tier-form-color'
      },
      featgroup:{
        list:'tier-form-featgroups'
      }
    }
  }
}

var SETquotesettings=(settings)=>{
  if(settings&&settings!=undefined){
    SETfinance(settings);
    SETdisc(settings);
    tierform.SETtierlist(settings.tiers,document.getElementById(quodom.tiers.list));
  }
}

//  DISCOUNTS  //
var SETdisc=(settings)=>{
  let cont = document.getElementById(quodom.discounts.list);
  cont.appendChild(document.createElement('div'));
  cont.lastChild.innerText = "Whole numbers represent dollar amounts. Decimals represent percentages."
  
  let table = document.createElement('table');

  let row = table.appendChild(document.createElement('tr'));
  row.appendChild(document.createElement('td'));
  row.lastChild.innerText = "Discount";
  row.appendChild(document.createElement('td'));
  row.lastChild.innerText = "Value";

  cont.appendChild(table);
  
  for(let ea in settings.discounts){
    row = table.appendChild(document.createElement('tr'));
    row.appendChild(document.createElement('td'));
    row.lastChild.appendChild(document.createElement('input'));
    row.lastChild.lastChild.value = settings.discounts[ea].title;
    row.lastChild.lastChild.classList.add(`${ea}-title`);
    row.appendChild(document.createElement('td'));
    row.lastChild.appendChild(document.createElement('input'));
    row.lastChild.lastChild.value = settings.discounts[ea].value;
    row.lastChild.lastChild.classList.add(`${ea}-value`);

    cont.appendChild(table);
  }
}

var GETdisc=()=>{
  let newsettings={};
  for(let ea in appsettings.quotesettings.discounts){
    newsettings[ea]={};
    newsettings[ea].title = document.getElementsByClassName(`${ea}-title`)[0].value;
    newsettings[ea].value = document.getElementsByClassName(`${ea}-value`)[0].value;
  }
  return newsettings;
}

document.getElementById(quodom.discounts.list).addEventListener('change', (ele)=>{
  appsettings.quotesettings.discounts = GETdisc();
  SAVEsettings();
});

//  FINANCE  //
var SETfinance=(settings)=>{
  let cont = document.getElementById(quodom.finance.list);
  for(let ea in settings.fintiers){
    let block = document.createElement('div');
    block.classList.add(`fintier-${ea}`);

    let table = block.appendChild(document.createElement('table'));
    let row = table.appendChild(document.createElement('tr'));
    row.appendChild(document.createElement('td'));
    row.lastChild.innerText = "Title";
    row.appendChild(document.createElement('td'));
    row.lastChild.innerText = "Term";
    row.appendChild(document.createElement('td'));
    row.lastChild.innerText = "Description";
    
    row = table.appendChild(document.createElement('tr'));
    for(let y in settings.fintiers[ea]){
      if(y != 'mfg'){
        row.appendChild(document.createElement('td'));
        row.lastChild.appendChild(document.createElement('input'));
        row.lastChild.lastChild.value = settings.fintiers[ea][y];
        row.lastChild.lastChild.classList.add(y);
      }
    }
    
    table = block.appendChild(document.createElement('table'));
    table.classList.add('mfg-block');
    
    row = table.appendChild(document.createElement('tr'));
    row.appendChild(document.createElement('td'));
    row.lastChild.innerText = "Manufacturer";
    row.appendChild(document.createElement('td'));
    row.lastChild.innerText = "Plan Code";
    row.appendChild(document.createElement('td'));
    row.lastChild.innerText = "Regular Rate";
    row.appendChild(document.createElement('td'));
    row.lastChild.innerText = "Promo Rate";
    row.appendChild(document.createElement('td'));
    row.lastChild.innerText = "Term Rate";

    for(let mfg in settings.fintiers[ea].mfg){
      row = table.appendChild(document.createElement('tr'));
      row.appendChild(document.createElement('td'));
      row.lastChild.innerText = mfg;
      for(let i in settings.fintiers[ea].mfg[mfg]){
        let inputcell = row.appendChild(document.createElement('td'));
        inputcell.appendChild(document.createElement('input'));
        inputcell.lastChild.value = settings.fintiers[ea].mfg[mfg][i];
        inputcell.lastChild.classList.add(`${mfg}-${i}`)
      }
    }
    cont.appendChild(block);
    cont.appendChild(document.createElement('hr'));
  }
}

var GETfinance=()=>{
  let newsettings={};
  for(let ea in appsettings.quotesettings.fintiers){
    newsettings[ea]={};
    for(let y in appsettings.quotesettings.fintiers[ea]){
      if(y != 'mfg'){
        newsettings[ea][y] = document.getElementsByClassName(`fintier-${ea}`)[0].getElementsByClassName(y)[0].value;
      }else{
        newsettings[ea][y]={};
        for(let mfg in appsettings.quotesettings.fintiers[ea].mfg){
          newsettings[ea].mfg[mfg]={};
          for(let i in appsettings.quotesettings.fintiers[ea].mfg[mfg]){
            newsettings[ea].mfg[mfg][i] = document.getElementsByClassName(`fintier-${ea}`)[0].getElementsByClassName(`${mfg}-${i}`)[0].value;
          }      
        }
      }
    }
  }
  return newsettings;
}

document.getElementById(quodom.finance.list).addEventListener('change',(ele)=>{
  appsettings.quotesettings.fintiers = GETfinance();
  SAVEsettings();
});
/////////////////////////

//  TIER  //
document.getElementById(tierform.tiedom.actions.save).addEventListener('click',(ele)=>{
  let tobj = tierform.GETtieredit();
  if(tobj.code!=''){
    let found = false;
    for(let x=1;x<appsettings.quotesettings.tiers.length;x++){
      if(appsettings.quotesettings.tiers[x].code == tobj.code){
        appsettings.quotesettings.tiers[x] = tobj;
        found=true;
        break;
      }
    }
    if(!found){
      appsettings.quotesettings.tiers.push(tobj);
    }
  }

  tierform.SETtierlist(appsettings.quotesettings.tiers,document.getElementById(quodom.tiers.list));
  console.log('add ',appsettings);
});
document.getElementById(tierform.tiedom.actions.delete).addEventListener('click',(ele)=>{
  let tobj = tierform.GETtieredit();
  for(let x=1;x<appsettings.quotesettings.tiers.length;x++){
      if(appsettings.quotesettings.tiers[x].code == tobj.code){
        appsettings.quotesettings.tiers.splice(x,x);
        SETtierlist(appsettings.quotesettings.tiers);
        break;
      }
  }
  console.log('delete ',appsettings);
});
/////////////////////////


//  PRICE KEY //
document.getElementById("admin-create-pricekey").addEventListener('click',(ele)=>{
  ipcRenderer.send(settingsroutes.createkey,'Settings');
});
ipcRenderer.on(settingsroutes.createkey,(eve,data)=>{
  if(data.key){
    console.log(data.key);
    DropNote('tr',data.msg,'green');
  }else{DropNote('tr',data.msg,'yellow')}
});
////////////////////////////////////////////////////////////////////////////////


var SAVEsettings=()=>{
  ipcRenderer.send(settingsroutes.save,appsettings);
}
ipcRenderer.on(settingsroutes.save,(eve,data)=>{
  console.log(data.msg, '-', data.data);
});

document.getElementById('titlebar-win-close').addEventListener('click', (ele)=>{window.close();})

$(document.getElementById('titlebar-page-user-cont')).hide();
$(document.getElementsByClassName('sidemenuview-menu-item')[0]).hide();  // Hides ADMIN menu option
//$(document.getElementsByClassName('sidemenuview-menu-item')[1]).hide();  // Hides QUOTE menu option
$(document.getElementsByClassName('sidemenuview-menu-item')[3]).hide();  // Hides CONNECTIONS menu option