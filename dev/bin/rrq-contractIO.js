var XlsxPop = require('xlsx-populate'); //https://github.com/dtjohnson/xlsx-populate
var {ExcelDateToJSDate} = require('../../bin/repo/tools/box/xltools.js');
var qtools = require('./rrq-quotertools.js');

var CREATEcontract=(quote,sysnum,pnum,tiernum,part,fin)=>{
console.log(quote);
  let system = quote.info.systems[sysnum];
  let info = system.tiers[tiernum].info;
  let size = system.tiers[tiernum].size;
  let contract = {
    jobnum:'',
    jobname:quote.name,
    strtdate:'',
    solddate:new Date().toISOString().split('T')[0],
    cons:quote.estimator,

    group:info.group[part],
    system:{
      name:system.name,
      tier:system.tiers[tiernum].name + " Comfort",
      area:system.areaserve,
      btuheating:system.btuheating,
      btucooling:system.btucooling,
      outlocation:system.outlocation,
      inlocation:system.inlocation,
    },
    customer:{
      name:quote.customer.name,
      street:quote.street,
      unit:quote.unit,
      city:quote.city,
      state:quote.state,
      zip:quote.zip,
      longcity:quote.city + ', ' + quote.state + ' ' + quote.zip,
      phone:quote.customer.phone,
      email:quote.customer.email
    },
    finance:{
      net:Number(system.pricing[tiernum][pnum].opts[part+"price"].price),
      creditfedtax:Number(part=='sys'?size.creditfedtax:0),
      lender:fin?system.pricing[tiernum][pnum].opts[part+"price"].lender:''
    },

    equipment:qtools.GENequiplist(info,size,part,system.swaps,tiernum,quote.info.key.groups[system.group].optheads,true),
    ratings:qtools.GENratingslist(size,part,tquote.info.key.groups[system.group].optheads),

    projdets:CLEANprojdets(system.projdets,part),
    enhancements:CLEANenhancements(tiernum,system.enhancements,part),
    additions:CLEANadditions(tiernum,system.additions,part),
    discounts:CLEANdiscounts(tiernum,system.discounts,part)
  }
  return contract;
}

var CLEANprojdets=(obj,part)=>{
  let newlist=[];
  for(let ea in obj){
    if(obj[ea].location.includes(part)){
      if(obj[ea].value==true){
        newlist.push(obj[ea].name);
      }else if(obj[ea].value!=false){
        newlist.push(obj[ea].name + '   ' + obj[ea].value);
      }
    }
  }
  return newlist;
}

var CLEANenhancements=(tiernum,list,part)=>{
  let servlist = [];
  let cplist = [];
  for(let a=0;a<list.length;a++){
    if(list[a].tiers[tiernum]>0 && list[a].location.includes(part)){
      let text = '';
      if(list[a].settings.includes('val')){
        let qty=0;
        if(part == 'sys'){
          qty = list[a].tiers[tiernum];
        }else{
          qty = list[a].tiers[tiernum]>1?list[a].tiers[tiernum]/2:1;
        }
        text = "(" + qty + ") ";
      }
      text = text + list[a].name;
      if(list[a].cat=="Service"){
        servlist.push(text);
      }else{
        cplist.push(text);
      }
    }
  }
  return {servlist:servlist,cplist:cplist};
}

var CLEANadditions=(tiernum,list,part)=>{
  let addslist = [];
  let metallist = [];
  for(let a=0;a<list.length;a++){
    if(list[a].tiers[tiernum]>0 && list[a].location.includes(part)){
      if(list[a].settings.includes('metal')){
        metallist.push({
          name:list[a].name,
          notes:list[a].notes,
          qty: list[a].tiers[tiernum]
        });
      }else{
        addslist.push({
          name:list[a].name,
          notes:list[a].notes,
          qty: list[a].tiers[tiernum]
        });
      }
      
    }
  }
  return {adds:addslist,metal:metallist};
}

var CLEANdiscounts=(tiernum,dlist,part)=>{
  let wpdiscs = [];
  for(let ea in qsettings.discounts.system){
    wpdiscs.push(ea);
  }
  let tempobj={
    userdiscs:{
      total:0
    }
  };
  // Need labels list
  // Need company to adjust labels
  for(let d=0;d<dlist.length;d++){
    if(dlist[d].ref.includes('userdisc')){  // if it is a user-generated discount, add it to the "Additional Discounts" list
      tempobj.userdiscs[dlist[d].ref] = dlist[d].tiers[tiernum][part];
      tempobj.userdiscs.total += dlist[d].tiers[tiernum][part];
    }else if(dlist[d].ref.includes(wpdiscs)){  // "Special Discounts" are added to the "Additional Discounts" list
      tempobj[dlist[d].ref] = dlist[d].tiers[tiernum][part];
      tempobj.userdiscs.total += dlist[d].tiers[tiernum][part];
    }else{
      tempobj[dlist[d].ref] = dlist[d].tiers[tiernum][part];  // remaining discounts are stored in their individual properties for recall
    }
  }
  return tempobj;
}

var PARSEexcel=(contract)=>{
  return new Promise((resolve,reject)=>{
    //console.log(contract);
    XlsxPop.fromFileAsync(contract).then(workbook => {
      var datasheet = workbook.sheet("PDaA");
      
      let tempc = {  //Temporary contract object
        jobnum : datasheet.cell("AS3").value(),
        strtdate:ExcelDateToJSDate(datasheet.cell("AJ3").value()),
        solddate:ExcelDateToJSDate(datasheet.cell("T56").value()),
        cons:datasheet.cell("G57").value(),

        group:'',
        /* Sys Info */
        system:{
          area:datasheet.cell("K28").value(),
          tier:datasheet.cell("C15").value(),
          btucooling:datasheet.cell("K30").value(),
          btuheating:datasheet.cell("K29").value(),
          outlocation:datasheet.cell("AO28").value(),
          inlocation:datasheet.cell("AO29").value(),
        },
        customer:{
          name:datasheet.cell("K9").value(),
          street:datasheet.cell("K10").value(),
          city:datasheet.cell("K11").value().split(',')[0],
          zip:datasheet.cell("K11").value().split(' ')[2],
          longcity:datasheet.cell("K11").value(),
          phone:datasheet.cell("K12").value(),
          email:datasheet.cell("K13").value()
        },
        equipment:{
          warrpart:datasheet.cell("K22").value(),
          warrlab:datasheet.cell("O22").value(),
          brand:[],
          model:[],
          label:[]
        },
        finance:{
          instntdscnt:datasheet.cell("AS11").value(),
          ameren:datasheet.cell("AS12").value(),
          manf:datasheet.cell("AS13").value(),
          net:datasheet.cell("AS16").value(),
          spcldscnt:datasheet.cell('AS14').value(),
          spire:datasheet.cell("AS24").value(),
          creditfedtax:datasheet.cell("AS25").value(),
          lender:datasheet.cell('AJ20').value()
        },
        ratings:{
          seer:datasheet.cell("W22").value(),
          afue:datasheet.cell("W24").value(),
          ahri:datasheet.cell("AA28").value(),
          account:datasheet.cell("AA29").value(),
          holder:datasheet.cell("AA30").value()
        },
        additions:[],
        enhancements:[]
      };

      for(let x=5;x<=8;x++){ //Gather Equipment
        if(datasheet.cell('D1'+x).value()!=''){
          tempc.equipment.label.push([datasheet.cell('D1'+x).value()]);
          tempc.equipment.model.push([datasheet.cell('K1'+x).value()]);
        }
      }

      for(let e=32;e<=32+6;e++){ //Read Enhancements
        if(datasheet.row(e).cell(4).value()!=''){
          tempc.enhancements.push({
            name:datasheet.row(e).cell(4).value(),
            notes:datasheet.row(e).cell(11).value(),
            qty:datasheet.row(e).cell(23).value()
          });
        }
      }
      return resolve(tempc);
    });
  });
}

var WRITEexcel=(contract,contractpath,saveAS=false)=>{
  console.log('Contract> ',contract);
  return new Promise((resolve,reject)=>{
    XlsxPop.fromFileAsync(contractpath).then(workbook => {
    var datasheet = workbook.sheet("PDaA");

    /* Job Info */
    datasheet.cell("AS3").value(contract.jobnum),
    datasheet.cell("AJ3").value(contract.strtdate),
    datasheet.cell("T56").value(contract.solddate),
    datasheet.cell("G57").value(contract.cons),

    /* Customer Info */
    datasheet.cell("K9").value(contract.customer.name);
    datasheet.cell("K10").value(contract.customer.street + " " + contract.customer.unit);
    datasheet.cell("K11").value(contract.customer.longcity);
    datasheet.cell("K12").value(contract.customer.phone);
    datasheet.cell("K13").value(contract.customer.email);

    /* System Info */
    datasheet.cell("C15").value(contract.system.tier);
    datasheet.cell("K28").value(contract.system.area);
    datasheet.cell("K29").value(contract.system.btuheating);
    datasheet.cell("K30").value(contract.system.btucooling);
    datasheet.cell("AQ28").value(contract.system.outlocation);
    datasheet.cell("AQ29").value(contract.system.inlocation);

    /* Financials */
    datasheet.cell('AP9').value(contract.system.tier + " Sale Price");
    datasheet.cell('AS11').value(contract.discounts.discinstnt);
    datasheet.cell('AS12').value(contract.discounts.rebateelec);
    datasheet.cell('AS13').value(contract.discounts.discmfg);
    datasheet.cell('AS14').value(contract.discounts.discspcl);
    datasheet.cell('AS15').value(contract.discounts.userdiscs.total);
    datasheet.cell('AS17').value(contract.finance.net);
    datasheet.cell('AS24').value(contract.discounts.rebategas);
    datasheet.cell('AS25').value(contract.finance.creditfedtax);
    datasheet.cell('AJ21').value(contract.finance.lender);

    /* Ratings */
    let rtings = {
      labels: [],
      values: [],
    };
    for(let i=0;i<contract.ratings.labels.length;i++){
      rtings.labels.push([contract.ratings.labels[i]]);
      rtings.values.push([contract.ratings.values[i]]);
    }
    datasheet.cell('T22').value(rtings.labels);
    datasheet.cell('W22').value(rtings.values);
    datasheet.cell('AA28').value(contract.ratings.ahri);
    datasheet.cell('AA29').value(contract.ratings.account);
    datasheet.cell('AA30').value(contract.ratings.holder);

    /* Equipment */
    // Reformat array to account for xlsx module weirdness
    // (Each item needs to be an "array of letters")
    let equip = {};
    for(let ea in contract.equipment){
      equip[ea] = [];
    }
    for(let e=0;e<contract.equipment.label.length;e++){
      for(let ea in contract.equipment){
        equip[ea].push([contract.equipment[ea][e]]);
      }
    }
    datasheet.cell('D15').value(equip.label);
    datasheet.cell('K15').value(equip.model);
    datasheet.cell("D22").value(equip.warrlabel);
    datasheet.cell("K22").value(equip.warrpart);
    datasheet.cell("O22").value(equip.warrlab);

    for(let i=1;i<9;i++){  //Finds full consultant name using table in contract
      if(contract.cons==workbook.sheet('Lists').row(i).cell(1).value()){
        datasheet.cell("G57").value(workbook.sheet('Lists').row(i).cell(2).value());
      }
    }

    for(let e=0;e<contract.enhancements.cplist.length;e++){   // Componenet enhancements loop
      datasheet.row(e+32).cell(4).value(contract.enhancements.cplist[e]);
    }
    for(let e=0;e<contract.enhancements.servlist.length;e++){   // Service enhancements loop
      datasheet.row(e+32).cell(20).value(contract.enhancements.servlist[e]);
    }
    for(let e=0;e<contract.projdets.length;e++){
      datasheet.row(e+32).cell(36).value(contract.projdets[e]);
    }

    if(contract.additions.adds.length>0){   //Checks to see if there are additions before looping through to add to sheet
      if(contract.additions.adds.length<=6){  //Checks to see if there are few enough to fit on the first page
        for(let e=0;e<contract.additions.adds.length;e++){
          if(contract.additions.adds[e].notes==""){
            datasheet.row(e+39).cell(4).value(contract.additions.adds[e].name);
          }else{
            datasheet.row(e+39).cell(4).value(contract.additions.adds[e].notes + " - " + contract.additions.adds[e].name);
          }
          datasheet.row(e+39).cell(47).value(contract.additions.adds[e].qty);
        }
      }else{
        for(let i=59;i<=115;i++){  //Unhides second page
          datasheet.row(i).hidden(false);
        }
        datasheet.row(39).cell(4).style("bold", true).value('*See Next Page for Full List*');
        for(let e=0;e<contract.additions.adds.length;e++){
          if(contract.additions.adds[e].notes==""){
            datasheet.row(e+68).cell(4).value(contract.additions.adds[e].name);
          }else{
            datasheet.row(e+68).cell(4).value(contract.additions.adds[e].notes + " - " + contract.additions.adds[e].name);
          }
          datasheet.row(e+68).cell(47).value(contract.additions.adds[e].qty);
        }
      }
    }

    if(contract.additions.metal.length>0){
      for(let e=0;e<contract.additions.metal.length;e++){
        datasheet.row(e+47).cell(28).value(contract.additions.metal[e].name);
        /*  Adding Name and Notes is too long for their current spot on the contract
        if(contract.additions.metal[e].notes==""){
          datasheet.row(e+47).cell(28).value(contract.additions.metal[e].name);
        }else{
          datasheet.row(e+47).cell(28).value(contract.additions.metal[e].notes + " - " + contract.additions.metal[e].name);
        }
        */
      }
    }

    if(saveAS){return resolve(workbook.toFileAsync(saveAS));}
    else{return resolve(workbook.toFileAsync(contractpath));}
    });
  });
}

module.exports={
  CREATEcontract,
  WRITEexcel
}
