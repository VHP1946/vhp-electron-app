var GENequiplist=(info,size,part,swaps=[],tiernum=null,optheads=[],warr=false)=>{
  let equipment={
    model:[],
    label:[]
  }
  if(warr){
      equipment.warrpart=[];
      equipment.warrlab=[];
      equipment.warrlabel=[];
  }  
  switch(part.toUpperCase()){   //Sets new Group based on SYSTEM/PARTIAL, deletes unused equip from Final Contract/Object
    case 'SYS':
      if(info.group.sys=='BO90'||info.group.sys=='BO80'){
        if(size.innmodel != ''){
          equipment.label.push(optheads.innmodel);
          equipment.model.push(size.innmodel);
        }
        equipment.label.push(optheads.inmodel);
        equipment.model.push(size.inmodel);
      }else{
        equipment.label.push(optheads.outmodel);
        equipment.label.push(optheads.innmodel);
        equipment.label.push(optheads.inmodel);
        equipment.model.push(size.outmodel);
        equipment.model.push(size.innmodel);
        equipment.model.push(size.inmodel);
      }
      break;
    case 'IN':
      if(info.group.sys=='AC90'||info.group.sys=='AC80'||info.group.sys=='HP90'||info.group.sys=='HP80'){
        equipment.label.push(optheads.inmodel);
        equipment.model.push(size.inmodel);
      }else{
        equipment.label.push(optheads.inmodel);
        equipment.label.push(optheads.innmodel);
        equipment.model.push(size.inmodel);
        equipment.model.push(size.innmodel);
      }
      break;
    case 'OUT':
      if(info.group.sys=='AC90'||info.group.sys=='AC80'||info.group.sys=='HP90'||info.group.sys=='HP80'){
        equipment.label.push(optheads.outmodel);
        equipment.label.push(optheads.innmodel);
        equipment.model.push(size.outmodel);
        equipment.model.push(size.innmodel);
      }else{
        equipment.label.push(optheads.outmodel);
        equipment.model.push(size.outmodel);
      }
      break;
  }
  equipment.label.push(optheads.statmodel);
  equipment.model.push(size.statmodel);

  for(let s in swaps){
    if(swaps[s].tiers[tiernum]!=null){
      for(let j=0;j<equipment.model.length;j++){
        if(swaps[s].tiers[tiernum].swapfrom == equipment.model[j]){
          equipment.model[j] = swaps[s].tiers[tiernum].swapto;
        }
      }
    }
  }

  /* Warranty Setup */
  if(warr){
      for(let w=0;w<equipment.label.length;w++){
          if(equipment.label[w]!='Controls'){
              equipment.warrlabel.push(equipment.label[w]);
              equipment.warrlab.push(info.warranty.labor);
              equipment.warrpart.push(info.warranty.parts);
              if(equipment.label[w]=='Gas Furnace' || equipment.label[w]=='Boiler'){
                  equipment.warrlabel.push('Heat Exchanger');
                  equipment.warrlab.push(info.warranty.labor);
                  equipment.warrpart.push(info.warranty.heatex);
              }
          }
      }
  }
  return equipment;
}
  
var GENratingslist=(size,part,optheads)=>{
  let rtings = {
    labels: [],
    values: [],
    ahri:size.ahri[part]!=null?size.ahri[part]:'',
    account: '',
    holder: ''
  };
  let incl = ['seer','hspf','afue'];
  for(let r=0;r<incl.length;r++){
    if(size[incl[r]][part]!=null){
      rtings.labels.push(optheads[incl[r]]);
      rtings.values.push(size[incl[r]][part]);
    }
  }
 
  return rtings;
}

var GETtableitem=(table,searchstring)=>{
  for(let i=0;i<table.length;i++){
    if(table[i].model==searchstring || table[i].name==searchstring){
      return table[i];
    }
  }
  
  return null;
}

var FINDtierinfo=(key,grp,tobj)=>{
  if(key.groups[grp]!=undefined && tobj){
    for(let x=0;x<key.groups[grp].systems.length;x++){
      if(key.groups[grp].systems[x].info.sysid == tobj.sysid){
        let options = key.groups[grp].systems[x].opts;
        for(let i=0;i<options.length;i++){
          if(options[i].inmodel==tobj.inmodel && options[i].innmodel==tobj.innmodel && options[i].outmodel==tobj.outmodel){
            return {info:key.groups[grp].systems[x].info,size:options[i]};
          }
        }
      }
    }
  }
  return null;
}

var CALCinsthours=(addlist,info,tiernum,part)=>{
  let hours = info.insthours[part];
  for(let a=0;a<addlist.length;a++){
    if(addlist[a].tiers[tiernum]>0){
      if(addlist[a].tiers[tiernum]<1){
        hours += Number(part=='sys'?addlist[a].labor:addlist[a].laborpart) * Number(addlist[a].tiers[tiernum]);
      }else{
        hours += Number(part=='sys'?addlist[a].labor:addlist[a].laborpart) * Number(addlist[a].tiers[tiernum]);
      }
    }
  }
  let temphours = hours;
  let twotechs = 0;  // 20 hrs = 2 guys / 1 day
  let onetech = 0;  // 10 hrs = 1 guy / 1 day
  let halfday = 0;  // 5 hrs = 1 guy / 1/2 day

  while(temphours>0){
    if(temphours>10){
      twotechs++;
      temphours -= 20;
    }else if(temphours<=10 && temphours>5){
      onetech++;
      temphours -= 10;
    }else{
      halfday++;
      temphours -= 5;
    }
  }

  twotechs = twotechs>0?`2 techs / ${twotechs} day` + (twotechs>1?'s':''):'';
  onetech = onetech>0?`1 tech / ${onetech} day` + (onetech>1?'s':''):'';
  halfday = halfday>0?`1 tech / half day` + (halfday>1?'s':''):'';
  
  let days = twotechs;
  if(days==''){
    days = onetech;
  }else if(onetech!=''){
    days = days + ' & ' + onetech;
  }
  if(days==''){
    days = halfday;
  }else if(halfday!=''){
    days = days + ' & ' + halfday;
  }

  return {hours:hours,days:days};
}

var CALCutilrebate=(rebtable,siteinfo,system,tiernum,part,type)=>{
  let company = siteinfo[type=='rebategas'?'gascomp':'eleccomp'];
  if(company=='none'){return 0};
  let statreb = 0;
  let rebate = 0;
  let erating = type=='rebategas'?system.tiers[tiernum].size.afue[part]:system.tiers[tiernum].size.seer[part];
  rebtable = rebtable[company];
  for(let r=0;r<rebtable.length;r++){
    if(rebtable[r].groups.includes(system.tiers[tiernum].info.group[part]) || rebtable[r].groups.toLowerCase()=='all'){
      if(rebtable[r].rating!='' && erating>=rebtable[r].rating && rebtable[r].amount>rebate){
        rebate = rebtable[r].amount;
      }else if(rebtable[r].cond.includes('Thermostat')){
        statreb = rebtable[r].amount;
      }
    } 
  }
  rebate += statreb;
  if(system.swaps['Controls']!=undefined){
    if(system.swaps['Controls'].tiers[tiernum]!=null){
      if(system.swaps['Controls'].tiers[tiernum].swapto==''){
        rebate -= statreb;
      }
    }
  }
  return rebate;
}

var CALCmanfrebate=(rebtable,system,tiernum,part,special=false)=>{
  if(system.swaps['Controls']!=undefined){
    if(system.swaps['Controls'].tiers[tiernum]!=null){
      if(system.swaps['Controls'].tiers[tiernum].swapto==''){
        return 0;
      }
    }
  }
  return special?system.tiers[tiernum].info.discspcl[part]:system.tiers[tiernum].info.discmfg[part];
}

module.exports={
  GENequiplist,
  GENratingslist,
  FINDtierinfo,
  CALCinsthours,
  GETtableitem,
  CALCutilrebate,
  CALCmanfrebate
}