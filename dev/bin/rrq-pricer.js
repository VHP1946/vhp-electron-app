var qsettings = {};

var INITpricer=(settings)=>{
  qsettings = settings;
}

var GENpricing=(system)=>{
  system.pricing=[];
  for(let t=0;t<system.tiers.length;t++){
    let priceops=[];
    for(let ft in qsettings.fintiers){
      if(system.tiers[t].size){
        priceops.push(GETsizeprice(system,t,ft));
      }
    }
    system.pricing.push(priceops);
  }
}

var GETaddprice=(tnum,alist,part,iaq=false)=>{
  let addprice = 0;  // Accessory items
  let iaqprice = 0;  // IAQ items
  if(alist!=undefined){
    for(let x=0;x<alist.length;x++){
      if(alist[x].location.includes(part.toLowerCase())){
        if(alist[x].tiers[tnum]>0){
          if(alist[x].cat!='Indoor Air Quality'){
            addprice += (Number(alist[x].pricesale) * Number(alist[x].tiers[tnum]))
          }else{
            iaqprice += (Number(alist[x].pricesale) * Number(alist[x].tiers[tnum]))
          }
        }
      }
    }
  }
  return iaq==false?addprice:iaqprice;
}

var GETdscntstotal=(tiernum,dlist,price,part)=>{
  let dprice = 0;
  if(dlist!=undefined){
    for(let x=0;x<dlist.length;x++){
      let value = Number(dlist[x].tiers[tiernum][part]);
      if(value>=1){
        dprice += value;
      }else{
        dprice += (price - dprice) * value;
      }
    }
  }
  return dprice;
}

var GETswapprice=(tiernum,swaps)=>{
  let swapprice = 0;
  for(let s in swaps){
    if(swaps[s].tiers[tiernum]!=null){
      swapprice += swaps[s].tiers[tiernum].cost;
    }
  }
  return swapprice;
}

var RUNpricecalc=(price,fincost,tinfo)=>{
  return (Number(price)+tinfo.addbefore-tinfo.minbefore)/(1-Number(fincost))+tinfo.addafter-tinfo.minafter;
}

var GETfincost=(price,fintier,tier,tinfo,part)=>{
  let maninfo = qsettings.maninfo;
  let fininfo = qsettings.fintiers[fintier];
  let mfg = (fininfo.mfg[tier.info.mfg.toUpperCase()]?tier.info.mfg:'DEFAULT').toUpperCase();
  let fgroup = {
    lender:fininfo.mfg[mfg].lender,
    cost:fininfo.mfg[mfg].std,
    rate:fininfo.mfg[mfg].rate
  };
  //check to see which rebate gets Vogel the most money back & append appropriate Rebate Suffix to inform admin
  if(!(fininfo.mfg[mfg].promo==0 && tier.info.discmfg[part]==0)){  // If there are no promotional rebates active, skip adding Rebate Suffix to Lender Code
    if(maninfo[mfg].dbldip==false){  
      let finrebate = (Number(price) + tinfo.addbefore - tinfo.minbefore) * fininfo.mfg[mfg].promo;
      finrebate = finrebate>maninfo[mfg].maxreb?maninfo[mfg].maxreb:finrebate;  // if over maximum rebate, set to maximum
      if(finrebate>(tier.info.discmfg[part]/2)){
        fgroup.lender = fgroup.lender + "-F";
      }else{
        fgroup.lender = fgroup.lender + "-I";
      }
    }else{
      fgroup.lender = fgroup.lender + "-D";
    }
  }
  return fgroup;
}

var GETmonthlyfin=(price,rate)=>{
  if(rate && rate!=undefined){
    if(rate>=1){return price/rate;}
    else{return price*rate;}
  }else{return 0;}
}

var GETsizeprice=(system,tiernum,ft)=>{
  let parts = ["sys","in","out"];
  let mfg = (qsettings.fintiers[ft].mfg[system.tiers[tiernum].info.mfg.toUpperCase()]?system.tiers[tiernum].info.mfg:'DEFAULT').toUpperCase();
  let tpobj = {
    desc:qsettings.fintiers[ft].mfg[mfg].desc,
    title:qsettings.fintiers[ft].title,
    opts:{}
  }
  for(let i=0;i<parts.length;i++){
    let baseprice = system.tiers[tiernum].size.price[parts[i]];
    let tinfo = {
      addbefore: GETaddprice(tiernum,system.additions,parts[i]),  // Calls for all accessories EXCEPT IAQ
      minbefore: GETswapprice(tiernum,system.swaps),  // Calls for swap cost
      addafter: GETaddprice(tiernum,system.additions,parts[i],true), // Calls for IAQ accessories
      minafter:0,
    };
    let fgroup = GETfincost(baseprice,ft,system.tiers[tiernum],tinfo,parts[i]);
    tpobj.opts[parts[i]+'price'] = {};
    tpobj.opts[parts[i]+'price'].price = RUNpricecalc(baseprice,fgroup.cost,tinfo).toFixed(2);
    tpobj.opts[parts[i]+'price'].price -= GETdscntstotal(
                                            tiernum,
                                            system.discounts,
                                            tpobj.opts[parts[i]+'price'].price,
                                            parts[i]
                                          ).toFixed(2);
    tpobj.opts[parts[i]+'price'].monthly = GETmonthlyfin(tpobj.opts[parts[i]+'price'].price,fgroup.rate).toFixed(2);
    tpobj.opts[parts[i]+'price'].lender = fgroup.lender;
  }
  return tpobj;
}

module.exports={
  INITpricer,
  GENpricing
}
