var {SETdatalistSPC,FINDparentele,FILLselect} = require('../../repo/gui/js/tools/vg-displaytools.js');
var {Dialog} = require('../../repo/gui/js/modules/vg-dialog.js');
var modlist;  // modifications list
var modlisthead;  // modifications header
var currmod = null;  // modificaiton currently being modified

var CREATEaddsview=(block,sysnum)=>{
  let sys = tquote.info.systems[sysnum];
  modlist = new ObjList([...tquote.info.key.mods]); //copy the accessories array
  modlisthead = modlist.GETlist().shift();  
  
  CREATEpdblock(block.getElementsByClassName(modbuild.moddom.views.mods.dets.selects)[0],sys.projdets);
  CREATEaddblock(block.getElementsByClassName(modbuild.moddom.views.mods.enh.selects)[0],sys.enhancements,'enhance',modlist.TRIMlist({}));
  CREATEaddblock(block.getElementsByClassName(modbuild.moddom.views.mods.adds.selects)[0],sys.additions,'adds');

  SETdatalistSPC(modlist.list,{cat:'mod-add-cat-list'});
  SETaccfilters(block);

  SETacclist(block); //exclude enhancements

  block.getElementsByClassName(modbuild.moddom.views.mods.list)[0].addEventListener('click',(eve)=>{ // Add to selects from list
      let lrow = FINDparentele(eve.target,modbuild.moddom.views.mods.listrow);
      let rowobj = gentable.GETrowTOobject(lrow)
      if(DupeCheck(sysnum,rowobj)){//check to see if item has been added
        block.getElementsByClassName(modbuild.moddom.views.mods.adds.selects)[0].appendChild(ADDselectline(rowobj,'adds'));
        DropNote('tr','Added to List','green');
      }else{
        DropNote('tr','Already on List','yellow');
      }
  });

  // Marks items for deletion
  block.getElementsByClassName(modbuild.moddom.views.mods.adds.selects)[0].addEventListener('click',(eve)=>{
    let clicked = eve.target.parentNode;
    if(clicked.classList.contains(modbuild.moddom.views.mods.selline.cont)){
      if(clicked.classList.contains('mod-to-delete')){
        clicked.classList.remove('mod-to-delete');
      }else{
        clicked.classList.add('mod-to-delete');
      }
    };
  });

  // Deletes selected items on button click, works from bottom of list up
  block.getElementsByClassName('build-mod-add-delete')[0].addEventListener('click',(eve)=>{
    let modcont = block.getElementsByClassName(modbuild.moddom.views.mods.adds.selects)[0];
    let change = false;
    for(let x=modcont.children.length-1;x>0;x--){
      if(modcont.children[x].classList.contains('mod-to-delete')){
        modcont.removeChild(modcont.children[x]);
        change = true;
      }
    }
    if(change){
      sysbuild.UPDATEsection('Additions',sysnum);
    }
  });

  // Show & Hide Modifications table
  block.getElementsByClassName('modslist-show')[0].addEventListener('click',(eve)=>{
    $(block.getElementsByClassName('min-page-cont-mods')[0]).show();
  });
  block.getElementsByClassName('min-page-hide-button')[0].addEventListener('click',(eve)=>{
    $(block.getElementsByClassName('min-page-cont-mods')[0]).hide();
  });

  // Add custom discount
  block.getElementsByClassName(modbuild.moddom.views.mods.form.addbutton)[0].addEventListener('click',(eve)=>{
    let value = block.getElementsByClassName(modbuild.moddom.views.mods.form.addin)[0].value;
    if(value!=''){
      block.getElementsByClassName(modbuild.moddom.views.mods.adds.selects)[0].appendChild(ADDselectline({
        name:value,
        notes:'',
        setting:'',
        tiers:[0,0,0,0],
        location:['sys'],
        labor:0,
        laborpart:0,
        pricesale:0,
        pricededuct:0
      },'adds'))
      block.getElementsByClassName(modbuild.moddom.views.mods.form.addin)[0].value = '';
    }
  })

  block.getElementsByClassName(modbuild.moddom.views.mods.dets.selects)[0].addEventListener('change',(eve)=>{
    sysbuild.UPDATEsection('Project Details',sysnum);
  });

  block.getElementsByClassName(modbuild.moddom.views.mods.enh.selects)[0].addEventListener('change',(eve)=>{
    sysbuild.UPDATEsection('Enhancements',sysnum);
  });

  block.getElementsByClassName(modbuild.moddom.views.mods.adds.selects)[0].addEventListener('change',(eve)=>{
    sysbuild.UPDATEsection('Additions',sysnum);
  });
}

var CREATEpdblock=(cont,list)=>{
  if(list.hasOwnProperty('strttime')){  // if the property already exists, use tquote values
    for(let ea in list){
      cont.appendChild(ADDprojdet(list[ea],ea));
    }
  }else{  // if the property does not exist => new system => use default values
    for(let ea in qsettings.projdetails){
      cont.appendChild(ADDprojdet(qsettings.projdetails[ea],ea));
    }
  }
}

var CREATEaddblock=(cont,list,block,addlist=[])=>{
  let titleline = cont.insertBefore(document.createElement('div'),cont.children[0]);
  titleline.classList.add(modbuild.moddom.views.mods.selline.cont);
  titleline.appendChild(document.createElement('div'));
  
  let tierblock = titleline.appendChild(document.createElement('div'));
    tierblock.classList.add(modbuild.moddom.views.mods.seltitle.tiers,'build-mod-add-tiers');
    for(let x=0;x<qsettings.tiers.length-1;x++){
      tierblock.appendChild(document.createElement('div')).innerText = qsettings.tiers[x+1].name;
    }
  let priceblock = titleline.appendChild(document.createElement('div'));
    priceblock.classList.add(modbuild.moddom.views.mods.seltitle.prices);
    priceblock.appendChild(document.createElement('div')).innerText = "Sale Price";
    priceblock.appendChild(document.createElement('div')).innerText = "Deduct Price";
    $(priceblock.lastChild).hide();
    
  if(block=='enhance'){
    $(priceblock).css('visibility','hidden');
  }else if(block=='details'){
    $(priceblock).css('visibility','hidden');
    $(tierblock).hide();
  }
  if(list.length>0){  
    for(let i=0;i<list.length;i++){
      cont.appendChild(ADDselectline(list[i],block));
    }
  }else if(block=='enhance'){  // sets default Enhancements if none exist 
    for(let x=0;x<addlist.length;x++){
      if(addlist[x].settings.includes('enhance')){
        cont.appendChild(ADDselectline(addlist[x],block));
      }
    }
  }
}

var SETenhancements=(sysnum,tiernum,init=false)=>{
  let enlist = document.getElementsByClassName(modbuild.moddom.views.mods.enh.selects,modbuild.moddom.cont)[sysnum].children;
  let system = tquote.info.systems[sysnum];
  for(let x=2;x<enlist.length;x++){
    if(init){
      if(enlist[x].children[1].children[0].innerText.includes('val')){
        let ref = enlist[x].children[1].children[0].innerText.split('val_')[1].split(',' || ' ')[0];
        enlist[x].getElementsByClassName(modbuild.moddom.views.mods.selline.tiers)[0].children[tiernum].innerText = system.tiers[tiernum].info.enhance[ref];
      }else{
        enlist[x].getElementsByClassName(modbuild.moddom.views.mods.selline.tiers)[0].children[tiernum].innerText = 1;
      }
    }else{
      enlist[x].getElementsByClassName(modbuild.moddom.views.mods.selline.tiers)[0].children[tiernum].innerText = system.enhancements[x-2].tiers[tiernum];
    }
  }
}

var SETadditions=(sysnum,tiernum,init=false)=>{
  let system = tquote.info.systems[sysnum];
  if(init && system.tiers[tiernum].size.adapt!=''){CHECKformetal(sysnum,tiernum)};
  let addlist = document.getElementsByClassName(modbuild.moddom.views.mods.adds.selects,modbuild.moddom.cont)[sysnum].children;
  for(let x=2;x<addlist.length;x++){
    if(init){
      let settings = addlist[x].children[1].children[0].innerText;
      if(settings.includes('trans') && (system.tiers[tiernum].size.adapt=='Both' || system.tiers[tiernum].size.adapt=='Trans')){
        addlist[x].getElementsByClassName(modbuild.moddom.views.mods.selline.tiers)[0].children[tiernum].value = 1;
      }else if(settings.includes('base') && (system.tiers[tiernum].size.adapt=='Both' || system.tiers[tiernum].size.adapt=='Base')){
        addlist[x].getElementsByClassName(modbuild.moddom.views.mods.selline.tiers)[0].children[tiernum].value = 1;
      }else{
        addlist[x].getElementsByClassName(modbuild.moddom.views.mods.selline.tiers)[0].children[tiernum].value = 0;
      }
    }else{
      addlist[x].getElementsByClassName(modbuild.moddom.views.mods.selline.tiers)[0].children[tiernum].value = system.additions[x-2].tiers[tiernum];
    }
  }
}

var editdets = new Dialog('editdets','Edit Details','PLACEHOLDER',['Okay','Cancel']);
editdets.actions.Okay.addEventListener('click',(eve)=>{
  currmod.getElementsByClassName('location')[0].innerText = GETlocation(eve.target.parentNode.parentNode.getElementsByClassName('location')[0].children);
  if(eve.target.parentNode.parentNode.getElementsByClassName('labor')[0]){
    currmod.getElementsByClassName('labor')[0].innerText = eve.target.parentNode.parentNode.getElementsByClassName('labor')[0].value;
    currmod.getElementsByClassName('laborpart')[0].innerText = eve.target.parentNode.parentNode.getElementsByClassName('laborpart')[0].value;
  }
  console.log(currmod.parentNode)
  currmod.parentNode.dispatchEvent(new Event('change'));  // update the appropriate section 
  editdets.CLOSEdialog();
});
editdets.actions.Cancel.addEventListener('click',editdets.CLOSEdialog);

var GETprojdets=(sysnum)=>{
  let dets = {};
  let list = document.getElementsByClassName(modbuild.moddom.views.mods.dets.selects)[sysnum];
  for(let ea in qsettings.projdetails){
    let ele = list.getElementsByClassName(`det-${ea}`)[0];
    dets[ea] = {
      name: ele.parentNode.parentNode.children[0].innerText,
      location: ele.parentNode.parentNode.getElementsByClassName('location')[0].innerText,
      notes: ele.parentNode.parentNode.children[0].title
    };
    if(ele.type=='checkbox'){
      dets[ea].value = ele.checked?true:false;
    }else{
      dets[ea].value = ele.value;
    }
  }
  return dets;
}

var GETenhancements=(sysnum)=>{
  let templist=[];
  let cont = document.getElementById('build-mod-views').getElementsByClassName('build-mod-system');
  let list = cont[sysnum].getElementsByClassName(modbuild.moddom.views.mods.enh.selects)[0].children;
  for(let y=2;y<list.length;y++){
    templist.push(GETselectline(list[y]));
  }
  return templist;
}

var GETadditions=(sysnum)=>{
  let templist=[];
  let cont = document.getElementById('build-mod-views').getElementsByClassName('build-mod-system');
  let list = cont[sysnum].getElementsByClassName(modbuild.moddom.views.mods.adds.selects)[0].children;
  for(let y=2;y<list.length;y++){
    templist.push(GETselectline(list[y]));
  }
  return templist;
}

// Accessory Selection List ////////////////////////////////////////////////////
var accfilterrow = null;
var SETaccfilters=(cont)=>{
  cont.getElementsByClassName('min-page-menu')[0].appendChild(gentable.SETrowFROMobject({name:'',notes:'',cat:''},true));
  accfilterrow = cont.getElementsByClassName('min-page-menu')[0].lastChild;
  accfilterrow.classList.add(modbuild.moddom.views.mods.listrow);
  accfilterrow.children[2].setAttribute('type','search');
  accfilterrow.children[2].setAttribute('list','mod-add-cat-list');
  accfilterrow.children[2].setAttribute('placeholder','Select Category');
  accfilterrow.children[0].setAttribute('placeholder','Search Item');
  accfilterrow.addEventListener('change',(ele)=>{
    let flts = gentable.GETrowTOobject(cont.getElementsByClassName('min-page-menu')[0].lastChild,true);
    SETacclist(cont,flts);
  });
}

var SETacclist=(cont,fltrs={})=>{
  let list = cont.getElementsByClassName(modbuild.moddom.views.mods.list)[0];
  let templist = modlist.TRIMlist(fltrs,true);
  let acclist = [];
  for(let i=0;i<templist.length;i++){
    if(!templist[i].settings.includes('only')){acclist.push(templist[i])}
  }
  gentable.BUILDtruetable([].concat(modlisthead,acclist),list,true,modbuild.moddom.views.mods.listrow);
}

// Functions //////////////////////////////////////////////////////

var DupeCheck=(sysnum,obj)=>{  //Checks for duplicates in mods table before adding
  let addcont = document.getElementsByClassName(modbuild.moddom.views.mods.adds.selects)[sysnum];
  for(let x=2;x<addcont.children.length;x++){
    let addobj = GETselectline(addcont.children[x]);
    if(addobj.name==obj.name && addobj.cat==obj.cat){
      return false;
    }
  }
  return true;
}

var ADDselectline=(aobj,block)=>{
  let row = document.createElement('div');
  row.classList.add(modbuild.moddom.views.mods.selline.cont);

  row.appendChild(document.createElement('div'));
  row.lastChild.innerText = aobj.name || '',
  row.lastChild.title = aobj.notes;
  let hiddeninfo = row.appendChild(document.createElement('div'));  // place hidden values in hidden div
  hiddeninfo.appendChild(document.createElement('div'));
    hiddeninfo.lastChild.innerText = aobj.settings;
    hiddeninfo.lastChild.classList.add('settings');
    hiddeninfo.appendChild(document.createElement('div'));
    hiddeninfo.lastChild.innerText = aobj.cat;
    hiddeninfo.lastChild.classList.add('cat');
    hiddeninfo.appendChild(document.createElement('div'));
    hiddeninfo.lastChild.innerText = aobj.labor;
    hiddeninfo.lastChild.classList.add('labor');
    hiddeninfo.appendChild(document.createElement('div'));
    hiddeninfo.lastChild.innerText = aobj.laborpart;
    hiddeninfo.lastChild.classList.add('laborpart');
    hiddeninfo.appendChild(document.createElement('div'));
    hiddeninfo.lastChild.innerText = aobj.location;
    hiddeninfo.lastChild.classList.add('location');
  $(hiddeninfo).hide();

  let tierblock = row.appendChild(document.createElement('div')); //create tiers container
  tierblock.classList.add(modbuild.moddom.views.mods.selline.tiers);

  for(let x=0;x<qsettings.tiers.length-1;x++){
    if(block=='enhance'){
      tierblock.appendChild(document.createElement('div'));
    }else{
      tierblock.appendChild(document.createElement('input'));
      tierblock.lastChild.type = 'number';
      tierblock.lastChild.min = '0';
    }
  }

  let priceblock = row.appendChild(document.createElement('div'));
    priceblock.classList.add(modbuild.moddom.views.mods.selline.prices);
    priceblock.appendChild(document.createElement('input'));
    priceblock.lastChild.type = 'number';
    priceblock.lastChild.value = aobj.pricesale!=undefined && aobj.pricesale!=''?aobj.pricesale:0;
    priceblock.appendChild(document.createElement('input'));
    priceblock.lastChild.type = 'number';
    priceblock.lastChild.value = aobj.pricededuct!=undefined && aobj.pricededuct!=''?aobj.pricededuct:0;
    $(priceblock.lastChild).hide();

  if(block=='enhance'){
    $(priceblock).css('visibility','hidden');
  }
  row.appendChild(document.createElement('div'));
  row.lastChild.appendChild(document.createElement('img'));
  row.lastChild.lastChild.src = '../bin/repo/assets/icons/more-info.png';
  row.lastChild.lastChild.addEventListener('click',(eve)=>{
    CLICKedit(eve.target.parentNode.parentNode);
  });

  return row;
}

var ADDprojdet=(aobj,pd)=>{
  let row = document.createElement('div');
  row.classList.add(modbuild.moddom.views.mods.selline.cont);

  row.appendChild(document.createElement('div'));
  row.lastChild.innerText = aobj.name;
  row.lastChild.title = aobj.notes;

  let hiddeninfo = row.appendChild(document.createElement('div'));  // place hidden values in hidden div
  hiddeninfo.appendChild(document.createElement('div'));
    hiddeninfo.appendChild(document.createElement('div'));
    hiddeninfo.lastChild.innerText = aobj.location;
    hiddeninfo.lastChild.classList.add('location');
  $(hiddeninfo).hide();

  let detsblock = row.appendChild(document.createElement('div')); 
  detsblock.classList.add(modbuild.moddom.views.mods.selline.dets);
  
  if(pd=='strttime'){
    let times = ['8:00 am','7:00 am']
    detsblock.appendChild(document.createElement('select'));
    FILLselect(detsblock.lastChild,times,false);
    detsblock.lastChild.value = aobj.value;
  }else if(typeof aobj.value=='boolean'){
    detsblock.appendChild(document.createElement('input'));
    detsblock.lastChild.type = 'checkbox';
    detsblock.lastChild.checked = aobj.value;
  }else{
    detsblock.appendChild(document.createElement('input'));
  }
  detsblock.lastChild.classList.add(`det-${pd}`);

  let priceblock = row.appendChild(document.createElement('div'));
  priceblock.classList.add(modbuild.moddom.views.mods.selline.prices);
  $(priceblock).css('visibility','hidden');

  row.appendChild(document.createElement('div'));
  row.lastChild.appendChild(document.createElement('img'));
  row.lastChild.lastChild.src = '../bin/repo/assets/icons/more-info.png';
  row.lastChild.lastChild.addEventListener('click',(eve)=>{
    CLICKedit(eve.target.parentNode.parentNode);
  });

  return row;
}

var CLICKedit=(ele)=>{
  currmod = ele;
  let locations = ele.getElementsByClassName('location')[0].innerText;
  let parts = ['System','Outdoor','Indoor'];
  let content = document.createElement('div');

  content.appendChild(document.createElement('div'));
  content.lastChild.classList.add(modbuild.moddom.views.mods.selline.location);
  for(let i=0;i<parts.length;i++){
    content.lastChild.appendChild(document.createElement('div')).innerText = parts[i];
  }
  content.appendChild(document.createElement('div'));
  content.lastChild.classList.add(modbuild.moddom.views.mods.selline.location, 'location');
  for(let i=0;i<parts.length;i++){
    content.lastChild.appendChild(document.createElement('input'));
    content.lastChild.lastChild.type = 'checkbox';
  }
  content.lastChild.children[0].checked = locations.includes('sys')?true:false;
  content.lastChild.children[1].checked = locations.includes('out')?true:false;
  content.lastChild.children[2].checked = locations.includes('in')?true:false;
  
  if(ele.parentNode.classList.contains(modbuild.moddom.views.mods.adds.selects)){
    let pricediv = content.appendChild(document.createElement('div'));
    pricediv.classList.add(modbuild.moddom.views.mods.selline.labor);
    pricediv.appendChild(document.createElement('div')).innerText = 'System Labor';
    pricediv.appendChild(document.createElement('div')).innerText = 'Partial Labor';
    pricediv = content.appendChild(document.createElement('div'));
    pricediv.classList.add(modbuild.moddom.views.mods.selline.labor);
    pricediv.appendChild(document.createElement('input'));
    pricediv.lastChild.classList.add('labor');
    pricediv.lastChild.value = Number(ele.getElementsByClassName('labor')[0].innerText);
    pricediv.appendChild(document.createElement('input'));
    pricediv.lastChild.classList.add('laborpart');
    pricediv.lastChild.value = Number(ele.getElementsByClassName('laborpart')[0].innerText);
  }
  
  editdets.UPDATEcontent(content);
  editdets.SHOWdialog();
}

var GETselectline=(aline)=>{
  let aobj = {};
  aobj.name = aline.children[0].innerText;
  aobj.notes = aline.children[0].title;
  for(let i=0;i<aline.children[1].children.length;i++){  // gathers other info from hidden block
    aobj[aline.children[1].children[i].classList] = aline.children[1].children[i].innerText;
  }
  let ele = aline.children[2].children;
  aobj.tiers=[];
  for(let x=0;x<ele.length;x++){
    aobj.tiers.push(ele[x].tagName=='DIV'?ele[x].innerText:ele[x].value);
  }
  ele = aline.children[3].children;
  aobj.pricesale = ele[0].value;
  aobj.pricededuct = ele[1].value;
  aobj.location = aline.getElementsByClassName('location')[0].innerText;
  return aobj;
}

var GETlocation=(checks)=>{
  let loc = [];
  if(checks[0].checked==true){loc.push('sys')}
  if(checks[1].checked==true){loc.push('out')}
  if(checks[2].checked==true){loc.push('in')}
  return loc;
}

var CHECKformetal=(sysnum,tiernum)=>{
  let addcont = document.getElementsByClassName(modbuild.moddom.views.mods.adds.selects)[sysnum]; 
  let metal = {
    trans: false,
    base: false
  }
  switch(tquote.info.systems[sysnum].tiers[tiernum].size.adapt){
    case 'Both':
      metal.base = true;
      metal.trans = true;
      break;
    case 'Trans':
      metal.trans = true;
      break;
    case 'Base':
      metal.base = true;
      break;
  }
  for(let ea in metal){
    if(metal[ea]==true){
      let modobj = FINDmodinfo(ea);
      console.log(ea, modobj)
      if(DupeCheck(sysnum,modobj)){
        addcont.appendChild(ADDselectline(modobj,'adds'));
      }
    }
  }
}

var FINDmodinfo=(ref)=>{
  let mods = modlist.list;
  for(let m=0;m<mods.length;m++){
    if(mods[m].settings.toLowerCase().includes(ref)){
      return mods[m];
    }
  }
  return null;
}

module.exports={
  CREATEaddsview,
  SETenhancements,
  SETadditions,
  GETprojdets,
  GETenhancements,
  GETadditions
}