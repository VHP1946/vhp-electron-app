const {stringValidate} = require('../../repo/tools/box/vg-gentools.js');
const qtools = require('../../back/rrq-quotertools.js');
const pricer = require('../../back/rrq-pricer.js');

var ADJUSTdependents=(view)=>{
  modbuild.modviews.REMOVEview(modbuild.modviews.FINDbutton(view.title));
  sumbuild.sumviews.REMOVEview(sumbuild.sumviews.FINDbutton(view.title));
  GETall();
  console.log('tquote',tquote)
}

var sbdom = {
  cont:'build-systems-cont',
  add:{
    name:'build-system-add-name',
    button:'build-system-add-button'
  },
  system:{
    list:'build-systems',
    cont:'build-system',
    info:{
      cont:'build-system-info',
      btucooling:'build-system-coolbtus',
      btuheating:'build-system-heatbtus',
      areaserve:'build-system-areaserve',
      outlocation:'build-system-outlocation',
      inlocation:'build-system-inlocation',
      group:'build-system-group'
    },
    tier:{
      list:'build-system-tiers',
      cont:'build-system-tier',
      info:{
        name:'build-system-tier-name',
        system:'build-system-tier-system'
      },
      size:{
        list:'build-system-tier-sizes',
        cont:'build-system-tier-size',
        row:'build-system-tier-size-row',
        info:{

        }
      }
    }
  }
}

var currtier = null; //holds the tier selected when choosing sizes (holds element)

var sysviews = new vcontrol.ViewGroup({ //selection views
  create:false,
  cont:document.getElementById(sbdom.cont),
  type:'mtl',
  delEve:ADJUSTdependents,
  swapEve:(eve)=>{UPDATEsection('System Name')}
});

var INITsysbuild=()=>{
  for(let x=0;x<tquote.info.systems.length;x++){
    if(tquote.info.systems[x].pricing==null || tquote.info.systems[x].pricing==undefined){  // if pulling from existing quote, but no pricing exists, get it
      pricer.GENpricing(tquote.info.systems[s]);  
    }
    CREATEsystem(tquote.info.systems[x].name,true);
  }
}

var CREATEsystem=(sysname,init=false)=>{
  let newsys = document.getElementById(sbdom.system.cont).cloneNode(true); //system tab
  newsys.id='';
  newsys.classList.add(sbdom.system.cont);
  sysviews.ADDview(sysname,newsys,true,true);
  let sysnum = sysviews.buttons.children.length - 1;
  GENsystemcard(newsys,sysnum); //setup as new system
  $(newsys).show();

  modbuild.CREATEmodview(sysname,sysnum);
  sumbuild.CREATEsumview(sysname,sysnum);

  if(init){
    SETsystem(sysnum);
  }
}

var GENsystemcard=(card,sysnum)=>{
  let tierlist = card.getElementsByClassName(sbdom.system.tier.cont);
  for(let x=1;x<tierlist.length;x++){card.getElementsByClassName(sbdom.system.tier.list)[0].removeChild(tierlist[x]);} //clean tier list to include only one child
  for(let x=1;x<qsettings.tiers.length;x++){//add tiers to card
    let tele = card.getElementsByClassName(sbdom.system.tier.cont)[0].cloneNode(true);
    tele.getElementsByClassName(sbdom.system.tier.info.name)[0].innerText=qsettings.tiers[x].name;
    tele.addEventListener('click',(ele)=>{ //open size selector
      UPDATEoptions(x,card.getElementsByClassName(sbdom.system.info.group)[0].value);
      currtier = tele;
      $(document.getElementsByClassName('min-page-cont')[0]).show();
    });
    card.getElementsByClassName(sbdom.system.tier.list)[0].appendChild(tele);
  }

  card.getElementsByClassName(sbdom.system.tier.list)[0].setAttribute('style',`grid-template-columns:repeat(${qsettings.tiers.length-1},1fr)`); //adjust grid-template-columns
  let system = tquote.info.systems[sysnum];
  if(system.group && system.group!=''){
    card.getElementsByClassName('build-system-tiers-headers')[0].innerHTML = gentable.SETrowFROMobject(tiermap(tquote.info.key.groups[system.group].optheads)).innerHTML;
  };

  card.getElementsByClassName(sbdom.system.tier.list)[0].removeChild(card.getElementsByClassName(sbdom.system.tier.cont)[0]);//clean tier list

  card.getElementsByClassName('build-system-info')[0].addEventListener('change',(ele)=>{
    UPDATEsection('System Info',sysnum);
  })
}

var tiermap=(obj)=>{
  let tempobj = {};
  let incl = [
    'sysid',
    'size',
    'outmodel',
    'innmodel',
    'inmodel',
    'statmodel',
    'adapt',
    'ahri',
    'btucooling',
    'seer',
    'hspf',
    'afue'
  ];
  for(let p=0;p<incl.length;p++){
    let prop = incl[p];
    if(typeof obj[incl[p]]=='object' && obj[incl[p]]!=null){
      tempobj[prop] = obj[prop].sys;
    }else{
      tempobj[prop] = obj[prop];
    }
  }
  return tempobj;
}

var UPDATEoptions=(tiernum,group)=>{
  if(tquote.info.key.groups[group]){ //check for valid group
    let syslist = [];
    for(let y=0;y<tquote.info.key.groups[group].systems.length;y++){ //find the systems tied to the tier
      if(qsettings.tiers[tiernum].code==tquote.info.key.groups[group].systems[y].info.tierid || tquote.info.key.groups[group].systems[y].info.tierid=='T0'){
        syslist.push(tquote.info.key.groups[group].systems[y]); //push systems that match the tier code
      }
    }
    document.getElementsByClassName('min-page-view')[0].getElementsByClassName(sbdom.system.tier.size.list)[0].innerHTML = ''; //clear size list

    let topts = [];
    for(let y=0;y<syslist.length;y++){
      for(let t=0;t<syslist[y].opts.length;t++){
        topts.push(tiermap(syslist[y].opts[t]))
      }
    }
    topts.unshift(tiermap(tquote.info.key.groups[group].optheads));  // add header row using option headers
    gentable.BUILDdistable(topts,document.getElementsByClassName('min-page-view')[0].getElementsByClassName(sbdom.system.tier.size.list)[0],true,sbdom.system.tier.size.row);
  }else{DropNote('tr','Group Not found in Key','red',false)} 
}

var SETsystem=(sysnum)=>{
  SETsysinfo(sysnum);
  for(let t=0;t<tquote.info.systems[sysnum].tiers.length;t++){
    modbuild.SETmodifications(sysnum,t);
    SETtier(sysnum,t,tquote.info.systems[sysnum].tiers[t].size);
  }
}

var SETsysinfo=(sysnum)=>{
  let system = tquote.info.systems[sysnum];
  let cont = document.getElementById(sbdom.cont).getElementsByClassName(sbdom.system.cont)[sysnum];
  cont.getElementsByClassName(sbdom.system.info.group)[0].value = system.group || '';
  cont.getElementsByClassName(sbdom.system.info.areaserve)[0].value = system.areaserve || '';
  cont.getElementsByClassName(sbdom.system.info.btucooling)[0].value = system.btucooling || '';
  cont.getElementsByClassName(sbdom.system.info.btuheating)[0].value = system.btuheating || '';
  cont.getElementsByClassName(sbdom.system.info.outlocation)[0].value = system.outlocation ||'';
  cont.getElementsByClassName(sbdom.system.info.inlocation)[0].value = system.inlocation || '';
}

var SETtier=(sysnum,tiernum,obj)=>{
  let tierlist = document.getElementById(sbdom.cont).getElementsByClassName(sbdom.system.cont)[sysnum].getElementsByClassName(sbdom.system.tier.cont);
  let tiercont = tierlist[tiernum];
  tiercont.getElementsByClassName('build-system-tier-size')[0].innerHTML = obj?gentable.SETrowFROMobject(tiermap(obj)).innerHTML:'';
}

// READING //////////////////////////////////////////////////////////////
var GETall=()=>{
  custbuild.GETquoteinfo();
  tquote.info.systems = [];
  let sysnames = FINDsystemlist();
  for(let s=0;s<sysnames.length;s++){
    tquote.info.systems[s]={};
    GETsystem(tquote.info.systems[s],s);
  }
}

var GETsystem=(system,sysnum)=>{
  GETsysteminfo(system, sysnum);
  let tierlist = document.getElementById(sbdom.cont).getElementsByClassName(sbdom.system.cont)[sysnum].getElementsByClassName(sbdom.system.tier.cont);
  system.tiers=[];
  for(let t=0;t<tierlist.length;t++){
    system.tiers[t] = GETtier(sysnum,t);
  }
  system.projdets = modbuild.modadds.GETprojdets(sysnum);
  modbuild.GETmodifications(system,sysnum);
  pricer.GENpricing(system);
}

var GETsysteminfo=(system,sysnum)=>{
  let systemele = document.getElementById(sbdom.cont).getElementsByClassName(sbdom.system.cont)[sysnum];
  system.name = systemele.title;
  system.group = systemele.getElementsByClassName(sbdom.system.info.group)[0].value;
  system.areaserve = systemele.getElementsByClassName(sbdom.system.info.areaserve)[0].value;
  system.btucooling = systemele.getElementsByClassName(sbdom.system.info.btucooling)[0].value;
  system.btuheating = systemele.getElementsByClassName(sbdom.system.info.btuheating)[0].value;
  system.outlocation = systemele.getElementsByClassName(sbdom.system.info.outlocation)[0].value;
  system.inlocation = systemele.getElementsByClassName(sbdom.system.info.inlocation)[0].value;
}

var GETtier=(sysnum,tiernum)=>{
  let tierlist = document.getElementById(sbdom.cont).getElementsByClassName(sbdom.system.cont)[sysnum].getElementsByClassName(sbdom.system.tier.cont);
  let sizeobj = gentable.GETrowTOobject(tierlist[tiernum].getElementsByClassName(sbdom.system.tier.size.cont)[0]);
  if(sizeobj==null){
    return {name:tierlist[tiernum].getElementsByClassName(sbdom.system.tier.info.name)[0].innerText}
  }
  let group = document.getElementById(sbdom.cont).getElementsByClassName(sbdom.system.cont)[sysnum].getElementsByClassName('build-system-group')[0].value;
  let tier = {};
  tier = qtools.FINDtierinfo(tquote.info.key,group,sizeobj);
  tier.name = tierlist[tiernum].getElementsByClassName(sbdom.system.tier.info.name)[0].innerText;
  return tier; 
}

// SETUP MODULE /////////////////////////////////////////////////////////////////

document.getElementById(sbdom.add.name).addEventListener('keypress',(eve)=>{
  if(eve.key == 'Enter'){document.getElementById(sbdom.add.button).click();};
});
document.getElementById(sbdom.add.button).addEventListener('click',(eve)=>{//add system to system list through build-system-add-button
  var sysname = document.getElementById(sbdom.add.name).value;
  if(sysname!='' && !CHECKforsystemname(sysname) && !stringValidate(sysname)){ //OR make a current system name
    ADDnewsystem(sysname);
  }else{DropNote('tr','Bad System Name','red')}
  sysname = '';
});

// SETUP SYSTEM SIZE SELECTOR ////////////////////////

document.getElementsByClassName('min-page-hide-button')[0].addEventListener('click',(ele)=>{
  $(document.getElementsByClassName('min-page-cont')[0]).hide();
});

var SELECTsizeopt=(ele)=>{
  if(ele.target.parentNode.classList.contains(sbdom.system.tier.size.row) && !ele.target.parentNode.classList.contains('vg-gentable-header')){
    currtier.getElementsByClassName(sbdom.system.tier.size.cont)[0].innerHTML = ele.target.parentNode.innerHTML;
    let syscard = currtier.parentNode.parentNode.parentNode;
    let grpname = syscard.getElementsByClassName(sbdom.system.info.group)[0].value;
    let sizeobj = gentable.GETrowTOobject(ele.target.parentNode);
    for(let y=0;y<syscard.parentNode.children.length;y++){
      if(syscard.parentNode.children[y] == syscard){//find the index of the system
        for(let x=0;x<currtier.parentNode.children.length;x++){
          if(currtier.parentNode.children[x]==currtier){ //find the index of the tier
            ADDnewoption(y,x,sizeobj);
          }
        }
      }
    }
    syscard.getElementsByClassName('build-system-tiers-headers')[0].innerHTML = gentable.SETrowFROMobject(tiermap(tquote.info.key.groups[grpname].optheads)).innerHTML;
  }
}

document.getElementsByClassName('min-page-view')[0].getElementsByClassName(sbdom.system.tier.size.list)[0].addEventListener('click',SELECTsizeopt);

//  Private functions ////////////////////////////

var ADDnewsystem=(sysname)=>{
  let sysnum = tquote.info.systems.length;
  tquote.info.systems[sysnum] = GENnewsystem(sysname);
  CREATEsystem(sysname);
}

var GENnewsystem=(sysname)=>{
  let system = {
    name: sysname,
    pricing:[],
    projdets:{},
    enhancements:[],
    additions:[],
    swaps:{},
    tiers:[]
    }
  for(let i=1;i<qsettings.tiers.length;i++){
    system.tiers.push({
      name:qsettings.tiers[i].name
    })
  }
  return system;
}

var ADDnewoption=(sysnum,tiernum,obj)=>{
  let system = tquote.info.systems[sysnum];
  SETtier(sysnum,tiernum,obj);
  system.tiers[tiernum] = GETtier(sysnum,tiernum);
  modbuild.SETmodifications(sysnum,tiernum,true);
  modbuild.GETmodifications(system,sysnum);
  pricer.GENpricing(system);
  sumbuild.SETsumtier(sysnum,tiernum);
}

var CHECKforsystemname=(name)=>{
  if(tquote.info.systems!=undefined){
    for(let x=0;x<tquote.info.systems.length;x++){
      if(tquote.info.systems[x].name==name){return true}
    }
  }
  return false;
}

var FINDsystemlist=()=>{
  let sysmenu = sysviews.buttons;
  let snames = [];
  for(let x=0;x<sysmenu.children.length;x++){
    snames.push(sysmenu.children[x].title);
  }
  return snames;
}

var UPDATEsection=(section,sysnum=null,tiernum=null)=>{
  let system = tquote.info.systems[sysnum];
  switch(section){
    case 'System Name':
      GETall();
      break;
    case 'Project Details':
      system.projdets = modbuild.modadds.GETprojdets(sysnum);
      break;
    case 'Enhancements':
      system.enhancements = modbuild.modadds.GETenhancements(sysnum);
      break;
    case 'Additions':
      system.additions = modbuild.modadds.GETadditions(sysnum);
      break;
    case 'Swaps':
      system.swaps = modbuild.modswaps.GETswaps(sysnum);
      modbuild.moddisc.SETdiscounts(sysnum,tiernum,true);
      system.discounts = modbuild.moddisc.GETdiscounts(sysnum);
      break;
    case 'Discounts':
      system.discounts = modbuild.moddisc.GETdiscounts(sysnum);
      break;
    case 'Project Discounts':
      for(let s=0;s<tquote.info.systems.length;s++){
        tquote.info.systems[s].discounts = modbuild.moddisc.GETdiscounts(s);
        pricer.GENpricing(tquote.info.systems[s]);
        sumbuild.REFRESHsystem(s);
      }
      break;
    case 'System Info':
      GETsysteminfo(system,sysnum);
      break;
    case 'Quote Info':
      custbuild.GETquoteinfo();
      for(let s=0;s<tquote.info.systems.length;s++){  // when utility companies change, update discounts
        for(let t=0;t<tquote.info.systems[s].tiers.length;t++){
          modbuild.moddisc.SETdiscounts(s,t,true);
        }
        tquote.info.systems[s].discounts = modbuild.moddisc.GETdiscounts(s);
        pricer.GENpricing(tquote.info.systems[s]);
        sumbuild.REFRESHsystem(s);
      }
      break;
  }
  if(sysnum!=null){
    pricer.GENpricing(system);
    sumbuild.REFRESHsystem(sysnum);
  }
  console.log(section + ' Change');
  console.log(tquote);
}

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
module.exports={
  INITsysbuild,
  GETall,
  GETsystem,
  UPDATEsection,
  sbdom,
  sysviews
}
