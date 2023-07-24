var {ipcRenderer} = require('electron');
var $ = require('jquery');
var path = require('path');

var RROOT = '../bin/repo/';
var Titlebar = require('../bin/repo/gui/js/modules/vg-titlebar.js');
var {DropNote} = require('../bin/repo/gui/js/modules/vg-dropnote.js');
var {priceformat} = require('../bin/repo/tools/box/vg-gentools.js');
var { DrawingPad } = require('../bin/repo/tools/box/drawing-pad.js');

var {auser} = require('../bin/appuser.js');
var {quotesls} = require('../bin/gui/storage/lstore.js');
var apaths = require('../app/paths.json');

var {Presentation} = require('../bin/gui/forms/presentation-form.js');

var pnavdom = {
  cont:'page-buttons',
  tier:{
    left:'tier-left',
    right:'tier-right',
    tag:'tier-name'
  },
  system:{
    up:'sys-up',
    down:'sys-down',
    tag:'sys-name'
  }
}

var presi = new Presentation(document.getElementsByClassName('rrq-presi-cont')[0]);

var notes = new DrawingPad(document.getElementsByClassName(presi.presdom.notes)[0]);
var DrawingPadShake=()=>{
  let width = window.innerWidth;
  let height = window.innerHeight;
  window.resizeBy(5,5);  // Shakes out canvas offset glitch
  window.resizeTo(width, height);
}
DrawingPadShake();
var signature = new DrawingPad(document.getElementsByClassName(presi.presdom.signature)[0]);

var qactions={
  partials:{
    id:'partials-toggle',
    src:'../bin/repo/assets/icons/layers.png',
    title: "Show/Hide Partials",
    onclick:(ele)=>{$(document.getElementsByClassName(presi.presdom.section.cont + 'partials')[0]).toggle();DrawingPadShake();}
  },
  up:{
    id:pnavdom.system.up,
    src:'../bin/repo/assets/icons/angle-up.png',
    title: 'Previous System',
    onclick:(ele)=>{CHANGEsys(ele);}
  },
  down:{
    id:pnavdom.system.down,
    src:'../bin/repo/assets/icons/angle-down.png',
    title: 'Next System',
    onclick:(ele)=>{CHANGEsys(ele);}
  }
}

function PRINTpresentation(ele){
  document.getElementById('presi-print').removeEventListener('click',PRINTpresentation);
  ipcRenderer.send('print-screen',{
    file:`Proposal for ${document.getElementById(Titlebar.tbdom.title).innerText}`,
    path:path.join(auser.cuser.spdrive,tquote.froot)
  });
}

ipcRenderer.on('print-screen',(eve,data)=>{
  document.getElementById('presi-print').addEventListener('click',PRINTpresentation);
  if(data.success){
    DropNote('tr','Printed Successfully. Wait to open OR got to folder to view file','green');
  }else{DropNote('tr','Print Failed. Check folder for file','yellow')}
});

var mactions={
  print:{
    id:'presi-print',
    src:'../bin/repo/assets/icons/print.png',
    title:'Print Presentation'
  },
  clearnotes:{
    id:'clear-notes',
    src:'../bin/repo/assets/icons/document-signed.png',
    title: "Clear Notes",
    onclick:(ele)=>{notes.clear();}
  },
  clearsig:{
    id:'clear-signature',
    src:'../bin/repo/assets/icons/document-signed.png',
    title: "Clear Signature",
    onclick:(ele)=>{signature.clear();}
  }
}

Titlebar.SETUPtitlebar(qactions,mactions);
document.getElementById('presi-print').addEventListener('click',PRINTpresentation);

$(document.getElementById(Titlebar.tbdom.info.cont)).hide();
$(document.getElementById(Titlebar.tbdom.page.settings)).hide();
$(document.getElementById(Titlebar.tbdom.page.print)).hide();
////////////////////

const tquote = JSON.parse(localStorage.getItem(quotesls.quotetopresi));
const qsettings = JSON.parse(localStorage.getItem(quotesls.qsettings));

var cons = auser.config;
var asspath = null;
var diricon = null;
var dirlogo = null;
var sysnum = 0;
var sysbuild = {};

var LOADresipresi=()=>{
  sysbuild = tquote.info.systems[sysnum];
  let group = sysbuild.group;

  // Titlebar Tweaks //////////////
  document.getElementById(Titlebar.tbdom.title).innerText = sysbuild.name;
  
  if(!qsettings.noparts.includes(group)){  // if system does not allow partials, hide option to show them
    $(document.getElementById(qactions.partials.id)).show();
  }else{
    $(document.getElementById(qactions.partials.id)).hide();
  }

  SETcustinfo();

  for(let i=0;i<sysbuild.tiers.length;i++){  // fill in each tier, section by section
    if(sysbuild.tiers[i].size && sysbuild.tiers[i].size!=null){
      let cont = {};
      for(let ea in presi.prescontent){   // Shows sections of all tiers
        cont[ea] = document.getElementsByClassName(presi.presdom.section.cont + ea)[0].getElementsByClassName(presi.presdom.tiercell.cont)[i];
        let tierbody = cont[ea].getElementsByClassName(presi.presdom.tiercell.body + ea)[0];
        let tiertitle = cont[ea].getElementsByClassName(presi.presdom.tiercell.title)[0];
        tiertitle.innerHTML = presi.prescontent[ea].titles!=null?presi.prescontent[ea].titles[i]:'&nbsp;';
        tierbody.style.backgroundColor = '';
        tierbody.innerHTML = presi.prescontent[ea].structure;
      }

      // Header ////////////////////
      cont.header.getElementsByClassName('rrq-head-value')[0].innerText = sysbuild.tiers[i].name;

      // User Experience ///////////
      cont.exp.getElementsByClassName('exp-list')[0].innerHTML = presi.prescontent.exp.content[i];
      cont.exp.getElementsByClassName(presi.presdom.icons.experience)[0].src = diricon + '/SmileyFace_' + (i+1) + '.png';

      if(sysbuild.swaps['Controls'].tiers[i]!=null){  // check to see if there is no thermostat
        if(sysbuild.swaps['Controls'].tiers[i].swapto==''){
          cont.exp.getElementsByClassName(presi.presdom.tiercell.title)[0].innerHTML = `&nbsp`;
          cont.exp.getElementsByClassName(presi.presdom.tiercell.body + 'exp')[0].innerHTML = presi.prescontent.exp.content.nostat;
          cont.exp.getElementsByClassName(presi.presdom.tiercell.body + 'exp')[0].style.backgroundColor = 'lightgray';
        }
      }
       
      let features = sysbuild.tiers[i].info.feat;
      // Home Comfort //////////////
      cont.comfort.getElementsByClassName(presi.presdom.icons.cooling)[0].src = diricon + '/comfort-cooling_' + features['comfort-cooling'] + '.png';
      $(cont.comfort.getElementsByClassName(presi.presdom.icons.cooling)[0].parentNode).css('visibility','unset');

      cont.comfort.getElementsByClassName(presi.presdom.icons.heating)[0].src = diricon + '/comfort-heating_' + features['comfort-heating'] + '.png';
      $(cont.comfort.getElementsByClassName(presi.presdom.icons.heating)[0].parentNode).css('visibility','unset');

      cont.comfort.getElementsByClassName(presi.presdom.icons.filters)[0].src = diricon + '/comfort-filters_' + CHECKmods(sysbuild,features,'comfort-filters') + '.png';
      $(cont.comfort.getElementsByClassName(presi.presdom.icons.filters)[0].parentNode).css('visibility','unset');
      
      cont.comfort.getElementsByClassName(presi.presdom.icons.soundslike)[0].src = diricon + '/comfort-soundslike_' + features['comfort-soundslike'] + '.png';
     
      if(group=='BOIL'){
        $(cont.comfort.getElementsByClassName(presi.presdom.icons.cooling)[0].parentNode).css('visibility','hidden');
        $(cont.comfort.getElementsByClassName(presi.presdom.icons.filters)[0].parentNode).css('visibility','hidden');
      }

      if(group=='AC&AHU'){
        if(sysbuild.swaps['Heat Kit'].tiers[i]!=null){
          if(sysbuild.swaps['Heat Kit'].tiers[i].swapto==''){
            $(cont.comfort.getElementsByClassName(presi.presdom.icons.heating)[0].parentNode).css('visibility','hidden');
          }
        }
      }

      // Value /////////////////////
      cont.value.getElementsByClassName('rrq-energy')[0].innerText = features['value-energy'];
      cont.value.getElementsByClassName('rrq-warranty')[0].innerText = sysbuild.tiers[i].info.warranty.labor;
      cont.value.getElementsByClassName('rrq-parts')[0].innerText = sysbuild.tiers[i].info.warranty.parts;
      cont.value.getElementsByClassName(presi.presdom.icons.value)[0].src = diricon + '/value-icon_' + features['value'] + '.png';

      // Print Headers /////////////
      cont.headerprint.getElementsByClassName('rrq-headerprint-value')[0].innerText = sysbuild.tiers[i].name;

      // Impact ////////////////////
      cont.impact.getElementsByClassName(presi.presdom.icons.impact)[0].src = diricon + '/impact-icon_' + features['impact'] + '.png';
      cont.impact.getElementsByClassName('rrq-impact-carbonreduct')[0].innerText = features['impact-carbonreduct'] + '% Reduction';
      cont.impact.getElementsByClassName('rrq-impact-emissions')[0].innerText = features['impact-emissions'] + ' Metric Tons';
      cont.impact.getElementsByClassName('rrq-impact-trees')[0].innerText = features['impact-trees'] + ' Trees';

      // Enhancements /////////////////////////////////////
      let enhancebody = cont.enhance.getElementsByClassName(presi.presdom.tiercell.body + 'enhance')[0];
      enhancebody.innerHTML = '';

      switch(i){
        case 0:
          $(enhancebody).css('text-align','center');
          for(let e=0;e<sysbuild.enhancements.length;e++){
            if(sysbuild.enhancements[e].tiers[i]>=1){
              enhancebody.appendChild(document.createElement('div'));
              enhancebody.lastChild.innerText = sysbuild.enhancements[e].notes!=''?sysbuild.enhancements[e].notes:sysbuild.enhancements[e].name;
              enhancebody.appendChild(document.createElement('hr'));
            }
          }
          break;
        case 1:
          $(enhancebody).css('text-align','center');
          for(let e=0;e<sysbuild.enhancements.length;e++){
            if(sysbuild.enhancements[e].tiers[i]>=1){
              enhancebody.appendChild(document.createElement('div'));
              enhancebody.lastChild.innerText = sysbuild.enhancements[e].notes!=''?sysbuild.enhancements[e].notes:sysbuild.enhancements[e].name;
              enhancebody.appendChild(document.createElement('hr'));
              $(enhancebody.lastChild).css('width','50%');
              $(enhancebody.lastChild).css('margin-top','2px')
              $(enhancebody.lastChild).css('margin-bottom','2px')
            }
          }
          break;
        case 2:
          let listbody = enhancebody.appendChild(document.createElement('ul'))
          for(let e=0;e<sysbuild.enhancements.length;e++){
            if(sysbuild.enhancements[e].tiers[i]>=1){
              listbody.appendChild(document.createElement('li'));
              listbody.lastChild.innerText = sysbuild.enhancements[e].notes!=''?sysbuild.enhancements[e].notes:sysbuild.enhancements[e].name;
            }
          }
          break;
        case 3:
          let listbody2 = enhancebody.appendChild(document.createElement('ul'))
          for(let e=0;e<sysbuild.enhancements.length;e++){
            if(sysbuild.enhancements[e].tiers[i]>=1){
              listbody2.appendChild(document.createElement('li'));
              listbody2.lastChild.innerText = sysbuild.enhancements[e].notes!=''?sysbuild.enhancements[e].notes:sysbuild.enhancements[e].name;
              $(listbody2.lastChild).css('margin-bottom','7px');
              $(listbody2.lastChild).css('line-height','1.25em');
            }
          }
          break;
      }

      // Additions ///////////////////////////////////
      if(sysbuild.additions.length==0){
        $(document.getElementsByClassName(presi.presdom.section.cont + 'adds')[0]).hide();
      }else{
        $(document.getElementsByClassName(presi.presdom.section.cont + 'adds')[0]).show();
        let tempcont = cont.adds.getElementsByClassName(presi.presdom.tiercell.body + 'adds')[0];
        tempcont.innerHTML = '';
        for(let e=0;e<sysbuild.additions.length;e++){
          if(sysbuild.additions[e].tiers[i]>=1){
            tempcont.appendChild(document.createElement('div'));
            tempcont.lastChild.innerText = sysbuild.additions[e].notes;
          }
        }
      }

      // Rebates / Discounts ////////////////////////////
      cont.discount.getElementsByClassName(presi.presdom.tiercell.body + 'discount')[0].innerHTML = GENdiscsection(i).innerHTML;

      // Investment /////////////////////////////////////
      let pricing = sysbuild.pricing[i];
      cont.finance.getElementsByClassName('fin-label-uf')[0].innerText = pricing[0].title;
      cont.finance.getElementsByClassName('fin-desc-uf')[0].innerText = pricing[0].desc;
      cont.finance.getElementsByClassName('fin-uf-price')[0].innerText = priceformat(pricing[0].opts.sysprice.price);
      
      cont.finance.getElementsByClassName('fin-label-low')[0].innerText = pricing[2].title;
      cont.finance.getElementsByClassName('fin-desc-low')[0].innerText = pricing[2].desc;
      cont.finance.getElementsByClassName('fin-low-mo')[0].innerText = priceformat(pricing[2].opts.sysprice.monthly);
      
      cont.finance.getElementsByClassName('fin-promo-label')[0].innerText = pricing[1].title + " - " + pricing[1].desc;
      cont.finance.getElementsByClassName('fin-promo-price')[0].innerText = priceformat(pricing[1].opts.sysprice.price);
      cont.finance.getElementsByClassName('fin-promo-mo')[0].innerText = priceformat(pricing[1].opts.sysprice.monthly);
      
      // Manufacturer ///////////////////////////////////
      cont.manf.getElementsByClassName('rrq-manf-logo')[0].src = diricon + '/' + (sysbuild.tiers[i].info.mfg)+'.png';

      // Partials ///////////////////////////////////////
      $(document.getElementsByClassName(presi.presdom.section.cont + 'partials')[0]).hide();
      cont.partials.getElementsByClassName('part-desc-uf')[0].innerText = pricing[0].desc;
      cont.partials.getElementsByClassName('rrq-part-upfront')[0].childNodes[2].innerText = priceformat(pricing[0].opts.outprice.price);
      cont.partials.getElementsByClassName('rrq-part-upfront')[0].childNodes[3].innerText = priceformat(pricing[0].opts.inprice.price);
      cont.partials.getElementsByClassName('rrq-part-lowest')[0].childNodes[2].innerText = priceformat(pricing[2].opts.outprice.monthly);
      cont.partials.getElementsByClassName('rrq-part-lowest')[0].childNodes[3].innerText = priceformat(pricing[2].opts.inprice.monthly);
      cont.partials.getElementsByClassName('part-promo-label')[0].innerText = pricing[1].desc;
      cont.partials.getElementsByClassName('rrq-part-promo')[0].childNodes[2].innerText = priceformat(pricing[1].opts.outprice.price);
      cont.partials.getElementsByClassName('rrq-part-promo')[0].childNodes[3].innerText = priceformat(pricing[1].opts.inprice.price);
      cont.partials.getElementsByClassName('rrq-part-promomo')[0].childNodes[2].innerText = priceformat(pricing[1].opts.outprice.monthly);
      cont.partials.getElementsByClassName('rrq-part-promomo')[0].childNodes[3].innerText = priceformat(pricing[1].opts.inprice.monthly);

    
    }else{  // IF A TIER IS EMPTY
      for(let key in presi.prescontent){   // Clears sections of empty tiers
        let tiercont = document.getElementsByClassName(presi.presdom.section.cont +key)[0].getElementsByClassName(presi.presdom.tiercell.cont)[i];
        tiercont.children[0].innerHTML = `&nbsp`;
        tiercont.children[1].innerHTML = '';
        tiercont.children[1].style.backgroundColor = 'lightgray';
      }
    }
  }
}

var GENdiscsection=(tiernum)=>{
  let disc = document.createElement('div');
  disc.classList.add('rrq-disc-applied');
  let discounts = sysbuild.discounts;
  for(let d=0;d<discounts.length;d++){
    if(discounts[d].tiers[tiernum].sys>1){
      disc.appendChild(document.createElement('div')).classList.add('rrq-disc-row');
      disc.lastChild.appendChild(document.createElement('div'));
      if(discounts[d].name=='Ameren Rebate'){
        disc.lastChild.lastChild.innerText = 'Ameren (' + sysbuild.tiers[tiernum].size.seer.sys + (sysbuild.group!='GEOT'?' SEER2)':' EER2)');
      }else{
        disc.lastChild.lastChild.innerText = discounts[d].name;
      }
      disc.lastChild.appendChild(document.createElement('div')).innerText = priceformat(discounts[d].tiers[tiernum].sys);
    }else if(discounts[d].tiers[tiernum].sys>0){
      disc.appendChild(document.createElement('div')).classList.add('rrq-disc-row');
      disc.lastChild.appendChild(document.createElement('div')).innerText = discounts[d].name;
      disc.lastChild.appendChild(document.createElement('div')).innerText = percentformat(discounts[d].tiers[tiernum].sys);
    }
  }
  if(sysbuild.tiers[tiernum].size.creditfedtax && sysbuild.tiers[tiernum].size.creditfedtax!=''){
    disc.appendChild(document.createElement('div')).classList.add('rrq-disc-row');
    disc.lastChild.appendChild(document.createElement('div')).innerText = 'Federal Tax Credit';
    disc.lastChild.appendChild(document.createElement('div')).innerText = priceformat(sysbuild.tiers[tiernum].size.creditfedtax);
  }
  return disc;
}

var percentformat=(price)=>{
  let fprice = Number(price)*100;
  return fprice + '%';
}

var CHANGEsys=(ele)=>{
  if(ele.target.id==pnavdom.system.down){
    sysnum--;
    if(sysnum<0){sysnum=tquote.info.systems.length-1;}
  }else{
    sysnum++;
    if(sysnum>=tquote.info.systems.length){sysnum=0;}
  }
  notes.clear();
  LOADresipresi();
}

var CHECKmods=(system,features,featname)=>{
  let addlist = system.additions;
  let val = features[featname];
  for(let a=0;a<addlist.length;a++){
    if(addlist[a].settings.includes(featname)){
      val++;
    }
  }
  return val;
}

var SETcustinfo=()=>{  // Print Header /////////////////
  document.getElementById('header-client-name').innerText = tquote.customer.name;
  document.getElementById('header-client-street').innerText = tquote.street;
  document.getElementById('header-client-longcity').innerText = tquote.city + ', ' + tquote.state + ' ' + tquote.zip;
  document.getElementById('header-client-system').innerText = tquote.info.systems[sysnum].name;
  document.getElementById('cons-phone').innerText = cons.cell;
  document.getElementById('cons-name').innerText = cons.name;
  document.getElementById('vogel-logo').src = dirlogo + '/Vogel Logo.png';
}

var SETmainicons=()=>{  // Set Section Icons /////////////////////
  document.getElementById('exp-main-icon').src = diricon + '/UserExperience.png';
  document.getElementById('comfort-main-icon').src = diricon + '/ComfortIcon.png';
  document.getElementById('value-main-icon').src = diricon + '/ValueIcon-01.png';
  document.getElementById('impact-main-icon').src = diricon + '/ImpactIcon-01.png';
  document.getElementById('enhance-main-icon').src = diricon + '/EnhancementIconV3.png';
  document.getElementById('adds-main-icon').src = diricon + '/ModificationIconV1.png';
  document.getElementById('finance-main-icon').src = diricon + '/InvestmentTag-01.png';
  document.getElementById('discount-main-icon').src = diricon + '/CashBackIcon.png';
  document.getElementById('partials-main-icon').src = diricon + '/StepIcon_V2-01.png';
}

if(tquote){
  console.log('QUOTE >',tquote);
  //localStorage.setItem(quotesls.quotetopresi,null)
  asspath = path.join(auser.cuser.spdrive,apaths.deproot,apaths.assets.root);
  diricon = path.join(asspath,apaths.assets.pvicons);
  dirlogo = path.join(asspath,apaths.assets.logos);
  SETmainicons();
  LOADresipresi();
}else{
  DropNote('tr','Quoute Could NOT Load','red',true);
}
