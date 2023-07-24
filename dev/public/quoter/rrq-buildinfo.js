var bidom={
  cont:'rrq-build-info',
  save:'rrq-save-quotebuild',
  edit:{
    cont:'build-info-edit'
  },
  quote:{
    cont:'customer-module-edit',
    id:'q-info-id',
    name:'q-info-name',
    address:{
      street:'q-info-street',
      unit:'q-info-unit',
      city:'q-info-city',
      state:'q-info-state',
      zip:'q-info-zip'
    },
    siteinfo:{
      gascomp:'q-info-gascomp',
      eleccomp:'q-info-eleccomp'
    },
    status:'q-info-status',
    customer:{
      id:'q-customer-id',
      name:'q-customer-cname',
      phone:'q-customer-cphone',
      email:'q-customer-cemail'
    },
    tracking:{
      prstdate:'q-tracking-prstdate',
      prstvia:'q-tracking-prstvia',
      time:'q-tracking-time',
      lead:'q-tracking-lead',
      source:'q-tracking-source'
    }

  }
}

var infocont = document.getElementById(bidom.edit.cont);
infocont.classList.add(vcontrol.vcdom.cont);
var qinfoviews = new vcontrol.ViewGroup({
  create:false,
  cont:infocont
});

var INITinfobuild=(appset)=>{
  document.getElementById(bidom.cont).addEventListener('change',(ele)=>{
    sysbuild.UPDATEsection('Quote Info');
  })
  SETquoteinfo();
}

var SETquoteinfo=()=>{
  document.getElementById(Titlebar.tbdom.title).innerText = tquote.id + ' - ' + tquote.name;
  document.getElementById(bidom.quote.name).value = tquote.name;
  document.getElementById(bidom.quote.status).value = tquote.progress;
  SETcustomerinfo();
  SETsiteinfo();
  SETaddressinfo();
  SETtrackinginfo();
}

var SETcustomerinfo=()=>{
  document.getElementById(bidom.quote.customer.id).value = tquote.customer.id;
  document.getElementById(bidom.quote.customer.name).value = tquote.customer.name;
  document.getElementById(bidom.quote.customer.phone).value = tquote.customer.phone;
  document.getElementById(bidom.quote.customer.email).value = tquote.customer.email;
}

var SETsiteinfo=()=>{
  if(!tquote.info.siteinfo.gascomp){  // temporary default settings
    tquote.info.siteinfo.gascomp = 'spire';
    tquote.info.siteinfo.eleccomp = 'ameren'
  }
  document.getElementById(bidom.quote.siteinfo.gascomp).value = tquote.info.siteinfo.gascomp;
  document.getElementById(bidom.quote.siteinfo.eleccomp).value = tquote.info.siteinfo.eleccomp;
}

var SETaddressinfo=()=>{
  document.getElementById(bidom.quote.address.street).value = tquote.street;
  document.getElementById(bidom.quote.address.unit).value = tquote.unit;
  document.getElementById(bidom.quote.address.city).value = tquote.city;
  document.getElementById(bidom.quote.address.state).value = tquote.state;
  document.getElementById(bidom.quote.address.zip).value = tquote.zip;
}

var SETtrackinginfo=()=>{
  document.getElementById(bidom.quote.tracking.prstdate).value = tquote.info.tracking.prstdate;
  document.getElementById(bidom.quote.tracking.prstvia).value = tquote.info.tracking.prstvia;
  document.getElementById(bidom.quote.tracking.time).value = tquote.info.tracking.time;
  document.getElementById(bidom.quote.tracking.lead).value = tquote.info.tracking.lead;
  document.getElementById(bidom.quote.tracking.source).value = tquote.info.tracking.source;
}

var GETquoteinfo=()=>{
  tquote.name = document.getElementById(bidom.quote.name).value;
  tquote.progress = document.getElementById(bidom.quote.status).value;
  GETcustomerinfo();
  GETsiteinfo();
  GETaddressinfo();
  GETtrackinginfo();
}

var GETcustomerinfo=()=>{
  tquote.customer.id = document.getElementById(bidom.quote.customer.id).value
  tquote.customer.name = document.getElementById(bidom.quote.customer.name).value
  tquote.customer.phone = document.getElementById(bidom.quote.customer.phone).value
  tquote.customer.email = document.getElementById(bidom.quote.customer.email).value
}

var GETsiteinfo=()=>{
  tquote.info.siteinfo.gascomp = document.getElementById(bidom.quote.siteinfo.gascomp).value;
  tquote.info.siteinfo.eleccomp = document.getElementById(bidom.quote.siteinfo.eleccomp).value;
}

var GETaddressinfo=()=>{
  tquote.street = document.getElementById(bidom.quote.address.street).value
  tquote.unit = document.getElementById(bidom.quote.address.unit).value
  tquote.city = document.getElementById(bidom.quote.address.city).value
  tquote.state = document.getElementById(bidom.quote.address.state).value
  tquote.zip = document.getElementById(bidom.quote.address.zip).value
}

var GETtrackinginfo=()=>{
  tquote.info.tracking.prstdate = document.getElementById(bidom.quote.tracking.prstdate).value
  tquote.info.tracking.prstvia = document.getElementById(bidom.quote.tracking.prstvia).value
  tquote.info.tracking.time = document.getElementById(bidom.quote.tracking.time).value
  tquote.info.tracking.lead = document.getElementById(bidom.quote.tracking.lead).value
  tquote.info.tracking.source = document.getElementById(bidom.quote.tracking.source).value
}



module.exports={
  INITinfobuild,
  SETquoteinfo,
  GETquoteinfo,
  bidom
}
