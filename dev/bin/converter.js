const {aquote} = require('../repo/ds/quotes/vogel-quote.js');
const {acustomer} = require('../repo/ds/customers/vogel-customers.js');
const qtools = require('./rrq-quotertools.js');
const quotedb = require('../db/dbsetup.js');

var qsettings = {};

var CHECKdataversion=(tquote)=>{
    if(tquote.info.key.version==undefined){
        return false;
    }
    /*
    let qdate = Date(tquote.info.key.date);
    let ddate = Date('6-22-23');

    console.log(tquote.info.key.date);
    console.log(qdate);
    console.log(ddate);

    if(qdate < ddate){
        console.log('Update Key');
        return false;
    }
    */
    return true;
}

var CONVERTdata=(tquote,qsets,keyloc)=>{
    qsettings = qsets;
    console.log('Old', tquote);
    let quote = aquote(tquote);
    quote.customer = acustomer(tquote.customer);
    let newkey = quotedb.GetPriceKey(keyloc);
    quote.info={
        key: newkey,
        siteinfo: {
            gascomp:'spire',
            eleccomp:'ameren'
        },
        systems: CONVERTsystems(newkey,tquote),
        tracking: tquote.info.tracking
    }
    console.log('New',quote)
    return quote;
}

var CONVERTsystems=(newkey,tquote)=>{
    let systems=[];
    let old = tquote.info.build?tquote.info.build.systems:tquote.info.systems;
    for(let s=0;s<old.length;s++){
        systems[s] = old[s];
        systems[s].projdets = CONVERTprojdets(old[s].projdets);
        systems[s].enhancements = CONVERTadditions(old[s].enhancements?old[s].enhancements:old[s].enhancments,newkey.mods);
        systems[s].additions = CONVERTadditions(old[s].additions,newkey.mods);
        systems[s].discounts = CONVERTdiscounts(old[s].discounts);
        systems[s].swaps = CONVERTswaps(tquote.info,s);
        systems[s].tiers = CONVERTtiers(newkey,old[s].group,old[s].tiers);
        systems[s].pricing = [[],[],[],[]];
        if(tquote.info.pricing){systems[s].oldprices = tquote.info.pricing.systems[s].tiers;}
        else if(old[s].pricing){systems[s].oldprices = old[s].pricing}  // saves old pricing since we will be forcing a re-calculation
        if(old[s].enhancments){delete old[s].enhancments;}  // remove incorrectly spelled property

    }
    return systems;
}

var CONVERTprojdets=(detslist)=>{
    let newobj = {};
    if(detslist!=undefined){
        for(let ea in qsettings.projdetails){
            newobj[ea] = detslist[ea] || qsettings.projdetails[ea];
        }
    }else{
        for(let ea in qsettings.projdetails){
            newobj[ea] = qsettings.projdetails[ea];
        }
    }
    return newobj;
}

var CONVERTadditions=(oldlist,modlist)=>{
    let newlist = [];
    for(let a=0;a<oldlist.length;a++){
        let found = false;
        for(let m=0;m<modlist.length;m++){
            if(oldlist[a].name==modlist[m].name){  // if the addition can be found in the current modtable, use that data
                let newobj = {};
                for(let ea in modlist[m]){
                    newobj[ea] = oldlist[a][ea] || modlist[m][ea];
                }
                newlist.push(newobj);
                found = true;
            }
        }
        if(!found){  // if the addition is not found in the current modtable, add olddata directly
            let newobj = {};
            for(let ea in modlist[0]){
                newobj[ea] = oldlist[a][ea] || '';
            }
            newobj.old = true;
            newlist.push(newobj);
        }
    }
    return newlist;
}

var CONVERTdiscounts=(oldlist)=>{
    let newlist = [];
    let found = [];
    for(let tds in qsettings.discounts.tier){
        found[tds] = false;
    }
    for(let d=0;d<oldlist.length;d++){
        newlist[d] = oldlist[d];
        found[oldlist[d].ref] = true;
        for(let t=0;t<oldlist[d].tiers.length;t++){
            newlist[d].tiers[t] = {
                sys: oldlist[d].tiers[t],
                out: 0,
                in: 0
            }
        }
    }
    for(let tds in found){  // add in missing tier discounts
        if(!found[tds]){
            newlist.push({
                name:qsettings.discounts.tier[tds],
                ref:tds,
                tiers:[{sys:0,out:0,in:0},{sys:0,out:0,in:0},{sys:0,out:0,in:0},{sys:0,out:0,in:0}]
            });
        }
    }
    return newlist;
}

var CONVERTswaps=(qinfo,sysnum)=>{
    let newlist = [];
    let slist = [];
    
    if(qinfo.build){slist=qinfo.build.swaps;}
    else{slist=qinfo.systems[sysnum].swaps;}

    if(slist==[] || slist==undefined){return newlist;}

    for(let s=0;s<slist.length;s++){

    }
    return newlist;
}

var CONVERTtiers=(newkey,group,oldlist)=>{
    let newlist = [];
    for(let t=0;t<oldlist.length;t++){
        if(oldlist[t].size==null){
            newlist[t] = {
                name:oldlist[t].name,
                info:null,
                size:null
            }
        }else{
            newlist[t] = qtools.FINDtierinfo(newkey,group,oldlist[t].size);
            newlist[t].name = oldlist[t].name;
        }
    }
    return newlist;
}


module.exports={
    CHECKdataversion,
    CONVERTdata
}