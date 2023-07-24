var {FILLselect}=require('../../repo/gui/js/tools/vg-displaytools.js');

var CREATEswapview=(block,sysnum)=>{
  for(let x=1;x<qsettings.tiers.length;x++){ //Setup title
    block.getElementsByClassName(modbuild.moddom.views.swaps.seltitle.tiers)[0].appendChild(document.createElement('div'))
    block.getElementsByClassName(modbuild.moddom.views.swaps.seltitle.tiers)[0].lastChild.innerText = qsettings.tiers[x].name;
  }

  block.getElementsByClassName(modbuild.moddom.views.swaps.list)[0].addEventListener('change',(ele)=>{
    for(let i=0;i<ele.target.parentNode.children.length;i++){
      if(ele.target.parentNode.children[i]==ele.target){
        sysbuild.UPDATEsection('Swaps',sysnum,i);
      }
    }
  });
}

var UPDATEswaplist=(sysnum)=>{
  let syscont = document.getElementById(modbuild.moddom.cont).getElementsByClassName(modbuild.moddom.system.cont);
  let slist = syscont[sysnum].getElementsByClassName(modbuild.moddom.views.swaps.list)[0];
  let system = tquote.info.systems[sysnum];

  slist.innerHTML = '';

  if(system.group!=''){
    let heads = tquote.info.key.groups[system.group].optheads;
    for(let i=0;i<system.tiers.length;i++){
      for(let ea in system.tiers[i].size){  
        if(qsettings.swapcats.includes(heads[ea])){  // Check if there are swap categories to add
          let found=false;
          for(let j=0;j<slist.children.length;j++){  // Check to see if the swap line already exists
            if(slist.children[j].children[0].innerText==heads[ea]){found=true}; 
          }
          if(!found){slist.appendChild(ADDswapline(heads[ea],ea));}
        }
      }
    }
    for(let j=0;j<slist.children.length;j++){
      for(let i=0;i<system.tiers.length;i++){
        let sline = slist.children[j];
        let valuebox = sline.children[1].children[i];
        let catname = sline.children[0].innerText;  // category display name
        let tier = system.tiers[i];
        if(tier.size){
          FILLselect(valuebox,FINDselectopts(catname,tier.info.mfg,i),true);
          let found=false;
          for(let s in system.swaps){
            if(s==catname && system.swaps[s].tiers[i]!=null){
              valuebox.value = system.swaps[s].tiers[i].swapto;
              found = true;
            }
          }
          if(!found){
            valuebox.value = tier.size[sline.ref];
            sline.location = modbuild.qtools.GETtableitem(tquote.info.key.mods,valuebox.value).location;
          }
        }else{
          valuebox.value = '';
        }
      }
    }
  }
}

var ADDswapline=(catname,ref)=>{
  let row = document.createElement('div');
  row.classList.add(modbuild.moddom.views.swaps.selline.cont);

  row.appendChild(document.createElement('div'));  // Name of swap category
  row.lastChild.innerText = catname || '',

  row.location = [];
  row.ref = ref,

  row.appendChild(document.createElement('div'));  // tier container
  row.lastChild.classList.add(modbuild.moddom.views.swaps.selline.tiers);

  for(let x=0;x<qsettings.tiers.length-1;x++){
    row.lastChild.appendChild(document.createElement('select'));
  }
  return row;
}

var FINDselectopts=(catname,mfg,tiernum)=>{
  let acclist = tquote.info.key.mods;
  mfg = mfg.toUpperCase();
  let mfgsettings = qsettings.maninfo[mfg]?qsettings.maninfo[mfg]:qsettings.maninfo['DEFAULT'];
  let list = [];
  for(let i=0;i<acclist.length;i++){
    if(acclist[i].cat==catname && acclist[i].model && acclist[i].settings.includes(String(tiernum+1))){
      if(mfgsettings.brandexclusive==true){
        if(acclist[i].mfg.toUpperCase()==mfg){
          list.push({
            value: acclist[i].model,
            text: acclist[i].name
          });
        }
      }else{
        if(acclist[i].mfg.toUpperCase()!='DAIKIN'){
          list.push({
            value: acclist[i].model,
            text: acclist[i].name
          });
        }
      }
    }
  }
  return list;
}

var GETswaps=(sysnum)=>{
  let slist = document.getElementById(modbuild.moddom.cont).getElementsByClassName(modbuild.moddom.system.cont)[sysnum].getElementsByClassName(modbuild.moddom.views.swaps.list)[0];
  let tempobj={};
  for(let i=0;i<slist.children.length;i++){
    tempobj[slist.children[i].children[0].innerText] = GETswapline(slist.children[i],sysnum);
  }
  return tempobj;
}

var GETswapline=(aline,sysnum)=>{
  let system = tquote.info.systems[sysnum];
  let tempobj={
    location:aline.location,
    ref:aline.ref,
    tiers:[]
  };
  for(let j=0;j<system.tiers.length;j++){
    if(system.tiers[j].size){
      let swapfrom = system.tiers[j].size[aline.ref];
      let swapto = aline.children[1].children[j].value;
      if(swapto!=swapfrom){
        tempobj.tiers.push({
                    swapto: swapto,
                    swapfrom: swapfrom,
                    cost: swapto==''?GETswapprice(swapfrom,true):GETswapprice(swapfrom)-GETswapprice(swapto)
                    });
      }else{
        tempobj.tiers.push(null);
      }
    }else{
      tempobj.tiers.push(null);
    }
  }
  return tempobj;
}

var GETswapprice=(item,deduct=false)=>{
  let acclist = tquote.info.key.mods;
  if(item==''){return 0}
  for(let i=0;i<acclist.length;i++){
    if(acclist[i].model==item){
      return Number(deduct?acclist[i].pricededuct:acclist[i].pricesale);
    }
  }
  return null;
}

module.exports = {
    CREATEswapview,
    UPDATEswaplist,
    GETswaps
}