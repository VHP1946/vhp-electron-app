var contractIO = require('../../back/rrq-contractIO.js');
const qtools = require('../../back/rrq-quotertools.js');

//create element object
var bsdom ={
  cont:'summary-system-cont',
  system:{
    port:'summary-systems-port',
    cont:'summary-systems-cont',
    tier:{
      cont:'tier-cont',
      name:'tier-equip-name',
      finance:{
        cont:'summary-tier-finance',
        partials:'summary-partials',
        indoor:'summary-finance-indoor',
        outdoor:'summary-finance-outdoor',
        system:'summary-finance-system'
      },
      equip:'summary-tier-equip',
      info:'summary-tier-info',
      enhance:'summary-tier-enhance',
      adds:'summary-tier-adds',
      disc:'summary-tier-disc'
    }
  }
}

var qsettings = {};
var part = "sys";

var sumviews = new vcontrol.ViewGroup({
  create:false,
  cont:document.getElementById(bsdom.cont),
  type:'mtl'
})

var INITsumbuild=(settings)=>{
  let parts = ["sys","in","out"];
  qsettings = settings;
  for(let i=0;i<parts.length;i++){  // Partial-selection buttons
    document.getElementById(`rrq-equip-${parts[i]}`).addEventListener('click',()=>{
      part = parts[i];
      REFRESHall();
      document.getElementById(`rrq-equip-${parts[i]}`).classList.add('equip-selection');
    })
  }
}

var REFRESHall=()=>{  // Refreshes the view after PART change
  for(let z=0;z<tquote.info.systems.length;z++){
    REFRESHsystem(z);
  }
  let cont = document.getElementById('rrq-equip-select');
  for(let i=0;i<cont.children.length;i++){
    cont.children[i].classList.remove('equip-selection');
  }
}

var REFRESHsystem=(sysnum)=>{
  for(let y=0;y<tquote.info.systems[sysnum].tiers.length;y++){
    SETsumtier(sysnum,y);
  }
}

var CREATEsumview=(sysname,sysnum)=>{
  var newsys = document.createElement('div');
  newsys.classList.add(bsdom.system.port);
  let system = tquote.info.systems[sysnum];
  var innercont = newsys.appendChild(document.createElement('div')); //Wraps all Tier Options
  innercont.classList.add(bsdom.system.cont);
  for(let t=0;t<system.tiers.length;t++){
    innercont.appendChild(GENsumtier(sysnum,t));
  }
  sumviews.ADDview(sysname,newsys,false);
}

var SETsumtier=(sysnum,tiernum)=>{
  let syscont = document.getElementsByClassName(bsdom.system.cont)[sysnum];
  let tiercont = syscont.children[tiernum];
  tiercont.parentNode.replaceChild(GENsumtier(sysnum,tiernum), tiercont);
}

var GENsumtier=(sysnum, tiernum)=>{
  let system = tquote.info.systems[sysnum];
  let tiercont = document.createElement('div'); //Wraps whole Tier Option
  tiercont.classList.add(bsdom.system.tier.cont);
  tiercont.appendChild(document.createElement('div')).classList.add(bsdom.system.tier.name);
  tiercont.lastChild.innerText = system.tiers[tiernum].name;
  if(system.tiers[tiernum].size!=null){
    if(part=="sys" || (!qsettings.noparts.includes(system.group))){ 
      tiercont.appendChild(GENsumfinance(sysnum,tiernum)); //add financing
      tiercont.appendChild(GENsumequip(system,sysnum,tiernum)); //add equipment
      tiercont.appendChild(GENsuminfo(sysnum,tiernum)); //add info
      //tiercont.appendChild(GENsumenhance(sysnum,tiernum)); //add enhancements
      tiercont.appendChild(GENsumadds(sysnum,tiernum)); //add additions
      tiercont.appendChild(GENsumdisc(sysnum,tiernum)); //add discounts
    }else{
      tiercont.appendChild(document.createElement('div')).innerText = "This option has no partials."
      tiercont.lastChild.classList.add('notice-text');
    }
  }else{
    tiercont.appendChild(document.createElement('div')).innerText = "No Option Selected"
    tiercont.lastChild.classList.add('notice-text');
  }
  return tiercont;
}

var GENsumfinance=(sysnum,tiernum)=>{
  let fincont = document.createElement('div');
  fincont.classList.add(bsdom.system.tier.finance.cont);
  let priceopts = tquote.info.systems[sysnum].pricing[tiernum];
  let syscont = fincont.appendChild(document.createElement('div'));
  syscont.classList.add(bsdom.system.tier.finance.system);
  for(let p=0;p<priceopts.length;p++){
    syscont.appendChild(document.createElement('div'));
    syscont.lastChild.innerText = priceopts[p].title + ': ' + Math.trunc(priceopts[p].opts[part+'price'].price);
    syscont.lastChild.addEventListener('dblclick',(ele)=>{
      POPsummary(sysnum,p,tiernum,part);
      floatv.SELECTview(document.getElementById('quote-popview'),'Summary Preview');
    });
  }
  return fincont;
}

var GENsumequip=(system, sysnum, tiernum)=>{
  let equipcont = document.createElement('div');
  equipcont.classList.add(bsdom.system.tier.equip);
  let info = system.tiers[tiernum].info;
  let size = system.tiers[tiernum].size;
  let equip;
  if(size && size!=null){
    equip = qtools.GENequiplist(info,size,part,system.swaps,tiernum);
  }
  if(size!=undefined && equip){
    equipcont.appendChild(document.createElement('div'));
    equipcont.lastChild.innerText = info.mfg;
    for(let i=0;i<equip.model.length;i++){
      equipcont.appendChild(document.createElement('div'));
      equipcont.lastChild.innerText = equip.model[i];
    }
  }else{
    equipcont.innerText = 'No equip option selected.';
    equipcont.classList.add('notice-text');
  }
  return equipcont;
}

var GENsuminfo=(sysnum, tiernum)=>{
  let infocont = document.createElement('div');
  infocont.classList.add(bsdom.system.tier.info);
  let system = tquote.info.systems[sysnum];
  let size = system.tiers[tiernum].size;
  let heads = tquote.info.key.groups[tquote.info.systems[sysnum].group].optheads;
  let ratings = ['seer','hspf','afue'];
    
  if(size.ahri[part]!=null){
    infocont.appendChild(document.createElement('div'))
    infocont.lastChild.innerText = 'AHRI: ' + (size.ahri[part]!='DNE'?size.ahri[part]:'No AHRI Rating');
  }
  for(let r=0;r<ratings.length;r++){
    if(size[ratings[r]][part]!=null){
      infocont.appendChild(document.createElement('div'));
      infocont.lastChild.innerText = heads[ratings[r]] + ': ' + size[ratings[r]][part];
    }
  }
  infocont.appendChild(document.createElement('div'));
  infocont.lastChild.innerText = heads.heights + ': ' + size.heights[part];
  let insttime = qtools.CALCinsthours(system.additions,system.tiers[tiernum].info,tiernum,part)
  infocont.appendChild(document.createElement('div'));
  infocont.lastChild.innerText = 'Install Hours: ' + insttime.hours;
  infocont.lastChild.title = 'Install Days: ' + insttime.days;
  if(heads.innmodel=='Heat Kit' && system.swaps[heads.innmodel].location.includes(part)){
    infocont.appendChild(document.createElement('div'));
    if(qsettings.swapcats.includes(heads.innmodel) && system.swaps[heads.innmodel].tiers[tiernum]!=null){
      let swapto = system.swaps[heads.innmodel].tiers[tiernum].swapto;
      infocont.lastChild.innerText = heads.innmodel + ': ' + (swapto!=''?qtools.GETtableitem(tquote.info.key.equip,swapto).size:'None');
    }else{
      infocont.lastChild.innerText = heads.innmodel + ': ' + qtools.GETtableitem(tquote.info.key.equip,size.innmodel).size;
    }
  }
  return infocont;
}

var GENsumenhance=(sysnum, tiernum)=>{
  let enhancecont = document.createElement('div');
  enhancecont.classList.add(bsdom.system.tier.enhance);
  let enhances = tquote.info.systems[sysnum].enhancements;
  if(enhances!=undefined){
    for(let x=0;x<enhances.length;x++){
      if(enhances[x].location.includes(part)){
        enhancecont.appendChild(document.createElement('div'));
        enhancecont.lastChild.innerText = enhances[x].name;
        if(enhances[x].tiers[tiernum]>0){$(enhancecont.lastChild).css('color','green');}
        else if(enhances[x].tiers[tiernum]<0){$(enhancecont.lastChild).css('color','red');}
        else{$(enhancecont.lastChild).css('color','gray');}
      };
    };
  };
  return enhancecont;
}

var GENsumadds=(sysnum, tiernum)=>{
  let addscont = document.createElement('div');
  addscont.classList.add(bsdom.system.tier.adds);
  let adds = tquote.info.systems[sysnum].additions;
  if(adds!=undefined){
    for(let x=0;x<adds.length;x++){
      if(adds[x].location.includes(part)){
        addscont.appendChild(document.createElement('div'));
        addscont.lastChild.innerText = adds[x].name;
        if(adds[x].tiers[tiernum]>=1){
          $(addscont.lastChild).css('color','green');
        }else{
          $(addscont.lastChild).css('color','gray');
        }
      }
    }
  }
  return addscont;
}

var GENsumdisc=(sysnum,tiernum)=>{
  let discont = document.createElement('div');
  discont.classList.add(bsdom.system.tier.disc);
  let discounts = tquote.info.systems[sysnum].discounts;
  if(discounts!=undefined){
    for(let i=0;i<discounts.length;i++){
      if(discounts[i].tiers[tiernum][part]>0){
        discont.appendChild(document.createElement('div'));
        discont.lastChild.innerText = discounts[i].name + ': ' + discounts[i].tiers[tiernum][part];
      }
    }
  }
  return discont;
}

var POPsummary=(sysnum,pnum,tiernum,part) => {
  let priceopt = tquote.info.systems[sysnum].pricing[tiernum][pnum];
  document.getElementById('financials-total').innerText = Math.trunc(priceopt.opts[part+'price'].price);
  document.getElementById('financials-mo').innerText = Math.trunc(priceopt.opts[part+'price'].monthly);
  document.getElementById('financials-lender').innerText = priceopt.opts[part+'price'].lender;
  $(document.getElementById('contract-cash')).replaceWith(document.getElementById('contract-cash').cloneNode(true)); // Removes all EventListeners
  document.getElementById('contract-cash').addEventListener('click',(ele)=>{
    PRODUCEcontract(sysnum,pnum,tiernum,part)
  });
  $(document.getElementById('contract-fin')).replaceWith(document.getElementById('contract-fin').cloneNode(true)); // Removes all EventListeners
  document.getElementById('contract-fin').addEventListener('click',(ele)=>{
    PRODUCEcontract(sysnum,pnum,tiernum,part,true)
  });
}

var PRODUCEcontract=(sysnum,pnum,tiernum,part,fin=false)=>{
  if(chckcreatecontract){
    DropNote('tr','Creating Contract','green');
    let temp = contractIO.CREATEcontract(tquote,sysnum,pnum,tiernum,part,fin);
    ipcRenderer.send(quoteroutes.createcontract,{quote:tquote,contract:temp});
    chckcreatecontract=false;
  }else{DropNote('tr','...Creating Contract','yellow')}
}

module.exports={
  INITsumbuild,
  CREATEsumview,
  REFRESHsystem,
  SETsumtier,
  bsdom,
  sumviews
}
