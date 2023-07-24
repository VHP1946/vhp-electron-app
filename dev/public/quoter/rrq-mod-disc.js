var parts = ['sys','out','in'];
var dscntBlockSet = false;
var wpdiscs = [];  // holds list of whole-project discounts, set first time CREATEdiscview is run
var sydiscs = [];
var tdiscs = [];

var CREATEdiscview=(block,sysnum)=>{
  let list = block.getElementsByClassName(modbuild.moddom.views.dscnts.list)[0];
  let sys = tquote.info.systems[sysnum];
  for(let x=1;x<qsettings.tiers.length;x++){ //Setup title
    block.getElementsByClassName(modbuild.moddom.views.dscnts.seltitle.tiers)[0].appendChild(document.createElement('div'))
    block.getElementsByClassName(modbuild.moddom.views.dscnts.seltitle.tiers)[0].lastChild.innerText = qsettings.tiers[x].name;
  }
  let wpdscnts = qsettings.discounts.project;  // Whole-project discounts
  let sydscnts = qsettings.discounts.system;  // System-wide discounts
  let tdscnts = qsettings.discounts.tier;  // Tier-specific discounts
  let wpdcont = document.getElementsByClassName('build-dscnts-cont')[0];
  if(!dscntBlockSet){ //only set project wide discounts once
    for(let ea in wpdscnts){
      wpdcont.appendChild(document.createElement('div'));
      wpdcont.lastChild.innerText = wpdscnts[ea].title;
      wpdcont.lastChild.appendChild(document.createElement('div'));
      wpdcont.lastChild.lastChild.classList.add('vg-checkbox');
      wpdcont.lastChild.lastChild.id = ea;
      wpdcont.lastChild.lastChild.addEventListener('click', (eve)=>{
        CLICKwpdiscounts(ea,eve.target);
        sysbuild.UPDATEsection('Project Discounts');
      });
    }
    for(let ea in wpdscnts){  // Creates a list of whole-project discounts to use later
      wpdiscs.push(ea);
    }
    for(let ea in sydscnts){
      sydiscs.push(ea);
    }
    for(let ea in tdscnts){
      tdiscs.push(ea);
    }
    dscntBlockSet = true;
  }

  let sysdcont = block.getElementsByClassName(modbuild.moddom.views.dscnts.sysdiscs)[0]
  for(let ea in sydscnts){
    sysdcont.appendChild(document.createElement('div'));
    sysdcont.lastChild.innerText = sydscnts[ea].title;
    sysdcont.lastChild.appendChild(document.createElement('div'));
    sysdcont.lastChild.lastChild.classList.add('vg-checkbox');
    sysdcont.lastChild.lastChild.classList.add(ea);
    sysdcont.lastChild.lastChild.addEventListener('click', (ele)=>{
      CLICKsysdiscounts(ea,ele.target,sysnum);
      sysbuild.UPDATEsection('Discounts',sysnum);
    });
  }

  if(sys!=undefined && sys.discounts!=undefined){  // Add discounts from quote
    for(let x=0;x<sys.discounts.length;x++){
      list.appendChild(ADDdscntline(sys.discounts[x],sysnum));
      if(wpdscnts[sys.discounts[x].ref]!=undefined){  // initialize whole project discounts
        if(!document.getElementById(sys.discounts[x].ref).classList.contains('vg-checkbox-checked')){
          document.getElementById(sys.discounts[x].ref).classList.add('vg-checkbox-checked');
        }
      }else if(sydscnts[sys.discounts[x].ref]!=undefined){
        if(!sysdcont.getElementsByClassName(sys.discounts[x].ref)[0].classList.contains('vg-checkbox-checked')){
          sysdcont.getElementsByClassName(sys.discounts[x].ref)[0].classList.add('vg-checkbox-checked');
        }
      }
    }
  }else{   // initialize new discounts
    for(let d in tdscnts){
      let defd = {
        name:tdscnts[d],
        ref:d,
        tiers:[]
      }
      for(let x=0;x<qsettings.tiers.length-1;x++){defd.tiers.push(0)}
      list.appendChild(ADDdscntline(defd,sysnum));
    }
    for(let i=0;i<sysdcont.children.length;i++){
      if(sysdcont.children[i].children[0].classList.contains('vg-checkbox-checked')){
        let wpobj = GETdscntinfo(sysdcont.children[i].children[0].id,true);
        list.appendChild(ADDdscntline(wpobj,sysnum));
      }
    }
  }

  // Add custom discount
  block.getElementsByClassName(modbuild.moddom.views.dscnts.form.addbutton)[0].addEventListener('click',(eve)=>{
    let value = block.getElementsByClassName(modbuild.moddom.views.dscnts.form.addin)[0].value;
    if(value!=''){
      block.getElementsByClassName(modbuild.moddom.views.dscnts.list)[0].appendChild(ADDdscntline({
        name: value,
        ref: GETnewref(block.getElementsByClassName(modbuild.moddom.views.dscnts.list)[0].children),
        notes: '',
        tiers:[{sys:0,out:0,in:0},{sys:0,out:0,in:0},{sys:0,out:0,in:0},{sys:0,out:0,in:0}]
      },sysnum))
      block.getElementsByClassName(modbuild.moddom.views.dscnts.form.addin)[0].value = '';
    }
  })

  // Marks items for deletion
  block.getElementsByClassName(modbuild.moddom.views.dscnts.list)[0].addEventListener('click',(eve)=>{
    let clicked = eve.target;
    if(clicked.classList.contains(modbuild.moddom.views.dscnts.selline.cont)){
      if(!wpdiscs.includes(clicked.children[1].innerText) && !sydiscs.includes(clicked.children[1].innerText) && !tdiscs.includes(clicked.children[1].innerText)){
        if(clicked.classList.contains('mod-to-delete')){
          clicked.classList.remove('mod-to-delete');
        }else{
          clicked.classList.add('mod-to-delete');
        }
      }
    };
  });

  // Deletes selected items on button click, works from bottom of list up
  block.getElementsByClassName('build-mod-disc-delete')[0].addEventListener('click',(eve)=>{
    let modcont = block.getElementsByClassName(modbuild.moddom.views.dscnts.list)[0];
    let change = false;
    for(let x=modcont.children.length-1;x>0;x--){
      if(modcont.children[x].classList.contains('mod-to-delete')){
        change = true;
        modcont.removeChild(modcont.children[x]);
      }
    }
    if(change){
      sysbuild.UPDATEsection('Discounts',sysnum);
    }
  });

  block.getElementsByClassName(modbuild.moddom.views.dscnts.list)[0].addEventListener('change',(eve)=>{
    sysbuild.UPDATEsection('Discounts',sysnum);
  });
}

var CLICKwpdiscounts=(refname,element)=>{
  if(element.classList.contains('vg-checkbox-checked')){
    element.classList.remove('vg-checkbox-checked');
    for(let s=0;s<tquote.info.systems.length;s++){
      let dlist = document.getElementsByClassName(modbuild.moddom.views.dscnts.list)[s].children;
      for(let d=0;d<dlist.length;d++){
        if(dlist[d].children[1].innerText==refname){
          dlist[0].parentNode.removeChild(dlist[d])
        }
      }
    }
  }else{
    element.classList.add('vg-checkbox-checked');
    for(let s=0;s<tquote.info.systems.length;s++){
      if(!discexists(s,refname)){
        let dlist = document.getElementsByClassName(modbuild.moddom.views.dscnts.list)[s];
        dlist.appendChild(ADDdscntline(GETdscntinfo(refname,true),s));
      }
    }
  }
}

var CLICKsysdiscounts=(refname,element,sysnum)=>{
  if(element.classList.contains('vg-checkbox-checked')){
    element.classList.remove('vg-checkbox-checked');
    let dlist = document.getElementsByClassName(modbuild.moddom.views.dscnts.list)[sysnum].children;
    for(let d=0;d<dlist.length;d++){
      if(dlist[d].children[1].innerText == refname){
        dlist[0].parentNode.removeChild(dlist[d])
      }
    }
  }else{
    element.classList.add('vg-checkbox-checked');
    if(!discexists(sysnum,refname)){
      let dlist = document.getElementsByClassName(modbuild.moddom.views.dscnts.list)[sysnum];
      dlist.appendChild(ADDdscntline(GETdscntinfo(refname),sysnum));
    }
  }
}

var SETdiscounts=(sysnum,tiernum,init=false)=>{
  let dlist = document.getElementsByClassName(modbuild.moddom.views.dscnts.list)[sysnum].children;
  let system = tquote.info.systems[sysnum];
  let info = system.tiers[tiernum].info;
  let size = system.tiers[tiernum].size;
  for(let x=0;x<dlist.length;x++){
    let discname = dlist[x].children[1].innerText;
    if(size!=null){
      for(let i=0;i<parts.length;i++){
        if(!init){
          dlist[x].children[2].children[tiernum].children[i].value = system.discounts[x].tiers[tiernum][parts[i]];
        }else if(discname=='rebateelec' || discname=='rebategas'){
          dlist[x].children[2].children[tiernum].children[i].value = modbuild.qtools.CALCutilrebate(tquote.info.key.rebates[discname],tquote.info.siteinfo,system,tiernum,parts[i],discname);
        }else if(discname=='discmfg' || discname=='discspcl'){
          dlist[x].children[2].children[tiernum].children[i].value = modbuild.qtools.CALCmanfrebate(tquote.info.key.rebates[info.mfg.toLowerCase()],system,tiernum,parts[i],discname=='discspcl'?true:false);
        }else if(sydiscs.includes(discname)){
          dlist[x].children[2].children[tiernum].children[i].value = parts[i]=='sys'?qsettings.discounts.system[discname].value.sys:qsettings.discounts.system[discname].value.part;
        }else if(wpdiscs.includes(discname)){
          console.log(discname)
          dlist[x].children[2].children[tiernum].children[i].value = parts[i]=='sys'?qsettings.discounts.project[discname].value.sys:qsettings.discounts.project[discname].value.part;
        }else if(!discname.includes('userdisc')){
          dlist[x].children[2].children[tiernum].children[i].value = info[discname][parts[i]];
        }
      }
    }
  }
}

var ADDdscntline=(dobj,sysnum=null)=>{
  let system = tquote.info.systems[sysnum];
  let row = document.createElement('div');
  row.classList.add(modbuild.moddom.views.dscnts.selline.cont);

  row.appendChild(document.createElement('input'));  // display name of discount
  row.lastChild.value = dobj.name || '',

  row.appendChild(document.createElement('div'));  // discount's reference name
  row.lastChild.innerText = dobj.ref|| '',
  $(row.lastChild).hide();
  row.appendChild(document.createElement('div'));  // tier container
  row.lastChild.classList.add(modbuild.moddom.views.dscnts.selline.tiers);

  for(let x=0;x<qsettings.tiers.length-1;x++){
    let trow = row.lastChild.appendChild(document.createElement('div'));
    for(let i=0;i<parts.length;i++){
      trow.appendChild(document.createElement('input'));
      if(dobj.tiers!=undefined && system.tiers[x].size!=undefined){
        trow.lastChild.value = dobj.tiers[x]!=undefined?dobj.tiers[x][parts[i]]:0;
      }
      trow.lastChild.title = parts[i].toUpperCase();
      trow.lastChild.type = 'number';
      trow.lastChild.min = '0';
    }
  }
  return row
}

var GETdiscounts=(sysnum)=>{
  let templist = [];
  let dlist = document.getElementsByClassName(modbuild.moddom.views.dscnts.list)[sysnum].children;
  for(let y=0;y<dlist.length;y++){
    templist.push(GETdscntline(dlist[y]));
  }
  return templist;
}

var GETdscntline=(aline)=>{
    var dobj = {
      name:aline.children[0].value,
      ref:aline.children[1].innerText,
      tiers:[]
    }
    for(let x=0;x<aline.children[2].children.length;x++){
      dobj.tiers[x]={
        sys: aline.children[2].children[x].children[0].value,
        out: aline.children[2].children[x].children[1].value,
        in: aline.children[2].children[x].children[2].value
      };
    }
    return dobj;
}

var discexists=(sysnum,refname)=>{
  let dlist = document.getElementsByClassName(modbuild.moddom.views.dscnts.list)[sysnum].children;
  for(let d=0;d<dlist.length;d++){
    if(dlist[d].children[1].innerText == refname){
      return true;
    }
  }
  return false;
}

var GETdscntinfo=(refname,project=false)=>{
  let dscnts = project?qsettings.discounts.project:qsettings.discounts.system;
  let dobj = {
      name:dscnts[refname].title,
      ref:refname,
      tiers:{},
  };
  for(let j=0;j<qsettings.tiers.length-1;j++){
      dobj.tiers[j]={}
      for(let i=0;i<parts.length;i++){
        dobj.tiers[j][parts[i]] = parts[i]=="sys"?dscnts[refname].value.sys:dscnts[refname].value.part;
      }
  }
  return dobj;
}

var GETnewref=(dlist)=>{
  let num = 0;
  for(let d=0;d<dlist.length;d++){
    if(dlist[d].children[1].innerText.includes('userdisc')){
      let testnum = Number(dlist[d].children[1].innerText.split('_')[1]);
      if(testnum>=num){
        num = testnum + 1;
      }
    }
  }
  return 'userdisc_'+num;
}

module.exports={
  CREATEdiscview,
  SETdiscounts,
  GETdiscounts
}