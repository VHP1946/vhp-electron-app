/* Different functions to handle keys held on excel books
*/
/* Option property names
    takes the second row of data on the key (opt property names),
    and places them up against any following rows that align
    vertically with it.

    Mapping is done by the shared name of the first row in the key.

    PASS:
        objhd = first object in sheet key holding option var names
        obj = option to be assigned the var names in objhd
*/
var qtools = require('./rrq-quotertools.js');
var qsettings = {};

var CONVERTopt=(obj,objhd,sysid)=>{  // quote.info.systems[sysnum].tiers[tiernum].size
  let tobj = {};

  // ==null => does not apply to current group
  // =='-' => no AHRI matchup found => ''
  // =='DNE' => 'Does Not Exist' => no AHRI matchup found

  // empty cell => undefined 

  for(let o in objhd){
    if(objhd[o].includes('_')){
      let group = objhd[o].split('_')[0];
      let part = objhd[o].split('_')[1];
      if(!tobj[group]){
        tobj[group]={
          sys:null,
          out:null,
          in:null
        }
      }
      if(obj[o]==undefined){
        tobj[group][part] = null;
      }else if(obj[o]=='-'){
        tobj[group][part] = '';
      }else{
        tobj[group][part] = obj[o];
      }
      if(group=='hspf' && part=='sys' && tobj.hspf.sys!=null){tobj.hspf.out = '-'}  // quick fix to add outdoor rating for hspf property
      if(typeof tobj[group][part]=='number'){
        if(group=='price'){tobj[group][part]=Number(Number(tobj[group][part]).toFixed(2))}
      }
    }else{
      tobj[objhd[o]] = obj[o] || '';
    }
  }
  
  tobj.sysid = sysid;  // Sets system ID for each size option to the system ID of the equipment pairing
  
  return tobj;
}

var CONVERToptheads=(obj,objhd)=>{  // quote.info.key.groups[group].optheads
  let tobj = {
    afue: 'AFUE',
    insthours: 'Install Hours',
    sysid: 'sysid'
  };
  for(let o in objhd){
    if(objhd[o].includes('_')){
      let group = objhd[o].split('_')[0];
      if(!tobj[group]){
        if(obj[o]==undefined){
          tobj[group] = null;
        }else if(obj[o]=='-'){
          tobj[group] = '';
        }else{
          tobj[group] = obj[o];
        }
      };
    }else{
      if(obj[o]==undefined){
        tobj[objhd[o]] = null;
      }else if(obj[o]=='-'){
        tobj[objhd[o]] = '';
      }else{
        tobj[objhd[o]] = obj[o];
      }
    }
  }
  tobj.heights = tobj.inmodel!='Boiler'?'Height':'Weight';
  return tobj;
}

var CONVERTinfo=(obj={})=>{  // quote.info.systems[sysnum].tiers[tiernum].info 
  if(!obj || obj==undefined){obj={}};
  let tobj = {};
  for(let ea in obj){
    if(!ea.includes('EMPTY')){
      if(ea.includes('_')){
        let group = ea.split('_')[0];
        let part = ea.split('_')[1];
        if(!tobj[group]){tobj[group]={}};
        tobj[group][part] = obj[ea];
      }else{
        tobj[ea] = obj[ea];
      }
    }
  }
  return tobj;
}

var tablekey=(obj={},table)=>{
  if(!obj || obj==undefined){obj={}}
  switch(table){
    case 'Mods':
      switch(String(obj.location).toLowerCase()){
        case 'both':
          obj.location = ['sys', 'out', 'in'];
          break;
        case 'out':
          obj.location = ['sys', 'out'];
          break;
        case 'in':
          obj.location = ['sys', 'in'];
          break;
        default:
          obj.location = ['sys'];
          break;
      }
      return{
        name:obj.Item || '',
        notes:obj.Notes || '',
        cat:obj.Category || '',
        mfg:obj.Manufacturer || '',
        model:obj.Model || '',
        settings:obj.Settings || '',
        location:obj.Location,
        labor:obj['System Hours'] || '',
        laborpart:obj['Partials Hours'] || '',
        pricededuct:obj['Sale Price'] || '',
        pricesale:obj.Deduction || '',
      }
      break;
    case 'Equip':
      return {
        model:obj.Model || '',
        type:obj.Type || '',
        brand:obj.Brand || '',
        price:obj.Price || '',
        size:obj.Size || '',
        afue:obj.AFUE || ''
      }
      break;
    case 'Rebates':
      return {
        groups:obj.Groups || '',
        cond:obj.Condition || '',
        rating:obj.Rating || '',
        amount:obj.Amount || ''
      };
      break;
    default:
      return obj;
      break;
  }
  return null;
}

var rrqkeymaker=(fname,reader,settings)=>{
  qsettings = settings;
  let parts = ['sys','out','in'];
  let xlkey = reader.readFile(fname);
  let key = {};
  let date = new Date().toISOString();
  key.date = date.split('T')[0];
  key.version = date.slice(2).split('.')[0].replace(/-/g,'').replace(/:/,'').replace(/:|t|z/gi,'.');
  key.mods = PULLtables(xlkey,reader,'Mods');
  key.equip = PULLtables(xlkey,reader,'Equip');
  key.rebates = PULLrebates(xlkey,reader);

  key.groups = {}; // list of groups represented as an object

  for(let x=0;x<xlkey.SheetNames.length;x++){  // Iterate through sheets
    if(qsettings.categories.includes(xlkey.SheetNames[x])){  // Collect all system groups        xlkey.SheetNames[x]=='90% SYS'
      let tsheet = reader.utils.sheet_to_json(xlkey.Sheets[xlkey.SheetNames[x]]);

      key.groups[xlkey.SheetNames[x]]={}; //name the GROUP
      let optvars = tsheet[0]; //size variables (for each system in the tier)
      key.groups[xlkey.SheetNames[x]].optheads = CONVERToptheads(tsheet[1],optvars,false); //size headers to display (for each size variable)
      key.groups[xlkey.SheetNames[x]].systems = []; //array for tiers

      for(let y=2;y<tsheet.length;y++){ //Start loop of key group
        if(tsheet[y].tierid){ //found the next tier
          let ttier = {}; //temporary TIER object
          ttier.info = CONVERTinfo(tsheet[y]); //take object as information (already have variable names on price book)
          ttier.info.insthours = {sys:18,out:8,in:8};
          ttier.info.warranty = {
            parts: tsheet[y+2].desc_in,
            labor: tsheet[y+3].desc_in,
            heatex: tsheet[y+4].desc_in
          };
          ttier.info.group={};
          ttier.info.discinstnt={};
          ttier.info.discmfg={};
          ttier.info.discspcl={};         

          for(let i=0;i<parts.length;i++){
            ttier.info.group[parts[i]] = tsheet[y+1]['group_'+parts[i]];
            ttier.info.discinstnt[parts[i]] = tsheet[y+2]['disc_'+parts[i]];
            ttier.info.discmfg[parts[i]] = tsheet[y+3]['disc_'+parts[i]];
            ttier.info.discspcl[parts[i]] = tsheet[y+4]['disc_'+parts[i]];
          }

          y+=5;  // skip to sizes
          /* Find sizes
              loop till sysid is true, this will be the header row displayed in price book
          */
          while(y<tsheet.length && !tsheet[y].sysid){y++;}
          y++; // Skip header row
          /* Gather all sizes and their info
          */
          ttier.opts = [];  // array to hold tier options
          while(y<tsheet.length && !tsheet[y].tierid && tsheet[y].sysid){
            let size = CONVERTopt(tsheet[y],optvars,ttier.info.sysid);  // passes sysid in to attach to each size option for later lookup
            ttier.opts.push({
                              ...size,
                              afue: FINDafue(size,key.equip),
                              heights: FINDequipheights(ttier.info,size,key.equip),
                              insthours: {sys:18,out:8,in:8}
                            }); 
            y++;
          }
          y--;
          key.groups[xlkey.SheetNames[x]].systems.push(ttier);
        }
      }
    }
  }
  return key;
}

var PULLtables=(xlkey,reader,table)=>{
  let temptable = [];
  let rawtable = reader.utils.sheet_to_json(xlkey.Sheets[table]);
  for(let x=0;x<rawtable.length;x++){
    temptable.push(tablekey(rawtable[x],table))
  }
  return temptable;
}

var PULLrebates=(xlkey,reader)=>{
  let temptable = {
    rebateelec:{},
    rebategas:{},
    manf:{}
  };
  let rawtable = reader.utils.sheet_to_json(xlkey.Sheets['Rebates']);
  for(let x=0;x<rawtable.length;x++){
    let table;
    let comp = rawtable[x].Company.toLowerCase();
    switch(rawtable[x].Type.toLowerCase()){
      case 'gas':
        table = 'rebategas';
        break;
      case 'electric':
        table = 'rebateelec';
        break;
      case 'manufacturer':
        table = 'manf';
        break;
      default:
        console.log('Type Does Not Match Known Options');
        break;
    }
    if(!temptable[table][comp]){temptable[table][comp]=[]}
    temptable[table][comp].push(tablekey(rawtable[x],'Rebates'))
  }
  return temptable;
}

var FINDequipheights=(info,opt,equiptbl)=>{
  let parts = ['sys','out','in'];
  let transht = 6;
  let baseht = 6;
  let sizes = {};
  for(let i=0;i<parts.length;i++){
    let size = 0;
    let equip = qtools.GENequiplist(info,opt,parts[i]);
    for(let j=0;j<equip.model.length;j++){
      for(let x=0;x<equiptbl.length;x++){
        if(equiptbl[x].model==equip.model[j] && typeof equiptbl[x].size=='number'){
          size += equiptbl[x].size;
        }
      }
    }
    if(parts[i]=='sys'){  // Adaptors only apply to systems
      switch(opt.adapt){
        case 'Both':
          size += transht + baseht;
          break;
        case "Trans":
          size += transht;
          break;
        case "Base":
          size += baseht;
          break;
        default:
          break;
      }
    }
    if(parts[i]=='in' && (opt.adapt=='Both' || opt.adapt=='Base')){  // Bases still needed on indoor
      size += baseht;
    }
    sizes[parts[i]] = size;   
  }

  //Should all AHU's get a base?
  //Is an AHU base height different than a furn base height?

  return sizes;
}

var FINDafue=(obj,equiplist)=>{
  if(obj.inmodel==''){
    return {sys:null,out:null,in:null};
  }
  for(let e=0;e<equiplist.length;e++){
    if(equiplist[e].model==obj.inmodel && equiplist[e].afue!=''){
      return {
        sys: equiplist[e].afue,
        out: null,
        in: equiplist[e].afue
      }
    }
  }
  return {sys:null,out:null,in:null};
}

module.exports = {
    rrqkeymaker
}
