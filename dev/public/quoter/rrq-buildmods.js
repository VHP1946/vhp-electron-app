var qtools = require('../../back/rrq-quotertools.js');
var modswaps = require('./rrq-mod-swaps.js');
var modadds = require('./rrq-mod-adds.js');
var moddisc = require('./rrq-mod-disc.js');

var moddom = {
  cont:'build-mod-cont',
  selected:'vg-subtab-selected',
  nav:{
    mods:'build-mod-adds-button',
    iaq:'build-mod-iaq-button',
    swaps:'build-mod-swaps-button',
    dscnts:'build-mod-dscnts-button'
  },
  system:{
    cont:'build-mod-system'
  },
  views:{
    mods:{
      cont:'build-mod-cont',
      selected:'build-mod-selected',
      adds:{
        selects:'build-mod-add-selects'
      },
      enh:{
        selects:'build-mod-enh-selects'
      },
      dets:{
        selects:'build-mod-dets-selects'
      },
      fltrs:{
        cats:'',
        item:'',
      },
      form:{
        addin:'build-mod-add-in',
        addbutton:'build-mod-add-inbutton',
      },
      seltitle:{
        cont:'build-mod-add-titles',
        dets:'build-mod-add-title-dets',
        tiers:'build-mod-add-title-tiers',
        prices:'build-mod-add-title-prices',
        location:'build-mod-add-title-location'
      },
      selline:{
        cont:'build-mod-add-line',
        dets:'build-mod-add-dets',
        tiers:'build-mod-add-tiers',
        priceselect:'build-mod-price-select',
        prices:'build-mod-add-prices',
        location:'build-mod-add-location',
        labor:'build-mod-add-labor'
      },
      list:'build-mod-add-list',
      listrow:'build-mod-add-list-line'
    },
    iaq:{
      cont:'build-iaq-cont'
    },
    dscnts:{
      cont:'build-dscnts-cont',
      seltitle:{
        cont:'build-mod-dscnts-titles',
        tiers:'build-mod-dscnts-title-tiers',
      },
      selline:{
        cont:'build-mod-dscnts-line',
        tiers:'build-mod-dscnts-tiers'
      },
      list:'build-dscnts-list',
      form:{
        addin:'build-mod-disc-in',
        addbutton:'build-mod-disc-inbutton',
      },
      sysdiscs: 'build-mod-disc-systemdisc'
    },
    swaps:{
      cont:'build-swaps-cont',
      seltitle:{
        cont:'build-mod-swaps-titles',
        tiers:'build-mod-swaps-title-tiers',
      },
      selline:{
        cont:'build-mod-swaps-line',
        tiers:'build-mod-swaps-tiers'
      },
      list:'build-swaps-list'
    }
  }
}

var modviews = new vcontrol.ViewGroup({
  create:false,
  cont:document.getElementById(moddom.cont),
  type:'mtl'
})

////////////////////////////////////////////////////////////////////////////////

var INITmodbuild=()=>{
  for(let n in moddom.nav){
    document.getElementById(moddom.nav[n]).addEventListener('click',(ele)=>{
      RESETmodviewer();
      let views = document.getElementsByClassName(moddom.views[n].cont);
      ele.target.classList.add(moddom.selected);
      for(let x=0;x<views.length;x++){
        $(views[x]).show();
      }
    });
  }
  $(document.getElementById(moddom.nav.iaq)).hide()  // Hiding IAQ tab until it is ready
}

var RESETmodviewer=()=>{
  for(let n in moddom.nav){
    document.getElementById(moddom.nav[n]).classList.remove(moddom.selected);
    let views = document.getElementsByClassName(moddom.views[n].cont);
    for(let x=0;x<views.length;x++){$(views[x]).hide()}
  }
}

var CREATEmodview=(sysname,sysnum)=>{
  let modsys = document.getElementById('build-mod-system').cloneNode(true);
  modsys.id = '';
  modsys.classList.add('build-mod-system');
  $(modsys).show();
  modviews.ADDview(sysname,modsys,false);

  modadds.CREATEaddsview(modsys.getElementsByClassName(moddom.views.mods.cont)[0],sysnum);
  modswaps.CREATEswapview(modsys.getElementsByClassName(moddom.views.swaps.cont)[0],sysnum);
  moddisc.CREATEdiscview(modsys.getElementsByClassName(moddom.views.dscnts.cont)[0],sysnum);
}

var SETmodifications=(sysnum,tiernum,init=false)=>{
  modadds.SETenhancements(sysnum,tiernum,init);
  modadds.SETadditions(sysnum,tiernum,init);
  modswaps.UPDATEswaplist(sysnum,tiernum,init);
  moddisc.SETdiscounts(sysnum,tiernum,init);
}

var GETmodifications=(system,sysnum)=>{
  system.enhancements = modadds.GETenhancements(sysnum);
  system.additions = modadds.GETadditions(sysnum);
  system.swaps = modswaps.GETswaps(sysnum);
  system.discounts = moddisc.GETdiscounts(sysnum);
}

module.exports={
  INITmodbuild,
  CREATEmodview,
  SETmodifications,
  GETmodifications,
  moddom,
  modviews,
  modswaps,
  modadds,
  moddisc,
  qtools
}
