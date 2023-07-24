var {cstmr,addrss} = require('./old-customers.js');
var {quotels} = require('./lstore.js');

const {AddBuild} = require('./additquote.js');
const {GBlockBuild} = require('./gbquote.js');
var {WinBuild} = require('./winquote.js');


/* HOME object
   want to move to own file
*/
var homeinfo = (hinf)=>{
  if(!hinf){
    hinf={};
  }return{
    sf:hinf.sf||'',
    atticsf:hinf.atticsf||'',
    roofmake:hinf.roofmake||'',
    occupants:hinf.occupants||'',
    direction:hinf.direction||'',
    heatload:hinf.heatload||'',
    coolload:hinf.coolload||''
  }
}

/*  Quote DOM view object
*/
var qvdom = {
    quote: {
        container: "vg-stdbook-cont",
        nav:{
            sidebar: "vg-stdbook-cont-sidenav",
            sidebuttons: "vg-stdbook-cont-sidenav-button",
            sidebuttonsele: "vg-stdbook-cont-sidenav-button-selected",
            right: "vg-stdbook-cont-sidenav-right",
            left: "vg-stdbook-cont-sidenav-left",
            viewbuttons:{
                build: "quoteview-build-button",
                customer: "quoteview-customer-button",
                gblock: "quoteview-gblock-button",
                additions:"quoteview-additions-button",
                summary: "quoteview-summary-button",
                present: "quoteview-present-button"
            }
        },
        pages:{
            cont: "vg-stdbook-pages",
            views:{
                build: "quoteview-build",
                customer:"quoteview-customer",
                gblock: "quoteview-gblock",
                additions: "quoteview-additions",
                summary: "quoteview-summary",
                present: "quoteview-present"
            },
            build:{},
            navbar:{
              ibox:'beeq-ibox-navbar',
              info:'beeq-info-navbar'
            },
            customer:{
              ibox:'beeq-ibox-quote',
              save:'beeq-save-quote',
              delete:'beeq-delete-quote',
              close:'beeq-close-quote',
              info:'beeq-info-quote'
            },
            gblock:{},
            additions:{},
            summary:{
              ibox:'beeq-ibox-summary',
              print:'beeq-print-summary',
              info:'beeq-info-summary'
            },
            present:{
              ibox:'beeq-ibox-present',
              print:'beeq-print-present',
              info:'beeq-info-present'
            }
        }
    }
}

/* Quote storage object

*/
var beequot = (bq)=>{
	if(!bq||bq==undefined){
		  bq = {};
	  }
	  return{
		  id: bq.id ||'', //
  
		  esitmator: bq.estimator || '',
		  notes:bq.notes||'',
		  address: bq.address || addrss(),
		  customer: bq.customer || cstmr(),
  
		  home:bq.home||homeinfo(),
  
		  notes:bq.notes||'',
  
		  status: bq.status || 'O', // Can be either: 'O'(OPEN), 'S'(SOLD), 'C'(COMPLETE) | DEFAULT = 'O'
  
		  createON: bq.createON || Date(), //inital as a date?
		  soldON: bq.soldON || Date(),
  
		  key: bq.key || {}, //holds the entire key for quote
  
		  data: bq.data || {
			windows:{},
			glassblocks:{},
			additions:{}
		  } //holds the data build/display
	  }
  }

class BEEQuote{
    constructor(beeq = null){
        console.log('Initialize Quote: ',beeq);

        this.quot = beequot(beeq);

        this.bqdom = {
            present:{
                cont:'',
                info:{
                  title:'present-customer-title',
                  name:'present-customer-name',
                  address:'present-customer-address',
                  csz:'present-customer-csz',
                  phone:'present-customer-phone',
                  email:'present-customer-email'
                },
                windows:{
                  tiers:{
                    cont:'present-window-headers',
                    item:{
                      cont:'present-window-tier-block',
                      name:'present-window-tier',
                      model:'present-window-model'
                    }
                  },
                  options:{
                    list:'present-window-options-list',
                    items:{
                      'Triple Glass':'present-option-TripleGlass',
                      'Upgrade Low-E':'present-option-UpgradeLowE',
                      'Tempered':'present-option-Tempered',
                      'Obscure':'present-option-Obscure',
                      'Internal Grids':'present-option-InternalGrid',
                      'Simulated Divided Light':'present-option-SimulatedDivided',
                      'Internal Blinds':'present-option-InternalBlinds',
                      'Interior Faux Laminate':'present-option-InteriorLaminate',
                      'Beige or Sandstone Base Color':'present-option-BiegeSandBase',
                      'Painted Exterior':'present-option-PaintedExterior',
                      'Bronze Base Color':'present-option-BronzeBase',
                      'Full Screen':'present-option-FullScreen'
                    }
                  },
                  trims:{
                    list:'present-window-trim-list',
                    item:{
                      cont:'present-window-trim',
                      name:'present-trim-name',
                      price:'present-trim-price',
                      selector:'present-trim-selector'
                    }
                  }
                },
                glassblocks:{
                  cont:'present-glassblocks',
                  list:{
                    cont:'present-glassblock-list',
                    item:{
                      cont:'present-glassblock',
                      name:'present-glassblock-name'
                    }
                  }
                },
                additions:{
                  cont:'present-additions',
                  list:{
                    cont:'present-addition-list'
                  }
                },
                invest:{
                  list:{
                    cont:'present-investment-list',
                    item:{
                      cont:'present-investment',
                      total:'present-investment-total',
                      monthly:'present-investment-monthly',
                      title:'present-finance-title'
                    }
                  }
                }
            },
            id:'q-quote-id',
            customer:{
              cont:'',
              id:'q-customer-id',
              fname:'q-customer-fname',
              lname:'q-customer-lname',
              phone:'q-customer-contact-phone',
              email:'q-customer-contact-email',
              street:'q-customer-address-street',
              suite:'q-customer-address-suite',
              city:'q-customer-address-city',
              state:'q-customer-address-state',
              zip:'q-customer-address-zip',
              notes:'q-customer-notes'
            },
            home:{
              sf:'q-home-sf',
              atticsf:'q-home-attic-sf',
              roofmake:'q-home-roof-make',
              occupants:'q-home-occupants',
              direction:'q-home-direction',
              heatload:'q-home-heatload',
              coolload:'q-home-coolload'
            },
            summary:{
                cont:'quoteview-summary',
                window:{
                    cont:'window-summary-cont',
                    tiers:{
                        cont:'window-summary-tiers',
                        nav:'window-summary-tier-toggles',
                        selected:'window-summary-tier-selected',
                        headers:'window-summary-tier-headers',
                        flags:{
                          size:'window-summary-tier-size-flag'
                        },
                        tier:{
                            cont:'window-summary-tier',
                            row:{
                                cont:'window-summary-tier-row',
                                values:'window-summary-row-values',

                                style:'window-summary-row-type',
                                model:'window-summary-row-model',
                                story:'window-summary-row-story',
                                room:'window-summary-row-room',
                                location:'window-summary-row-location',
                                width:'window-summary-row-width',
                                height:'window-summary-row-height',
                                options:{
                                    cont:'window-summary-row-options',
                                    included:'window-summary-row-option-included',
                                    excluded:'window-summary-row-option-excluded',
                                }
                            }
                        }
                    }
                },
                glassblock:{
                    cont:'gb-summary-cont',
                    list:{
                        cont:'gb-summary-list',
                        row:{
                            cont:'gb-summary-row',
                            values:'gb-summary-row-values',
                            area:'gb-summary-row-area',
                            width:'gb-summary-row-width',
                            height:'gb-summary-row-height',
                            options:{
                                cont:'gb-summary-row-options'
                            }
                        }
                    }
                },
                additions:{
                  cont:'add-summary-cont',
                  list:{
                    cont:'add-summary-list',
                    row:{
                      cont:'add-summary-row',
                      values:'add-summary-row-values',
                      desc:'add-summary-row-desc',
                      amount:'add-summary-row-amount'
                    }
                  }
                }
            }

        }

        //include builders
        this.winbuild = new WinBuild(this.quot.key,this.quot.data.windows); //share key with windows
        this.quot.data.windows = this.winbuild.data; //link window data{}

        this.gbbuild = new GBlockBuild(this.quot.key,this.quot.data.glassblocks); //share key with glass block
        this.quot.data.glassblocks = this.gbbuild.data; //link glass block data{}

        this.addbuild = new AddBuild(this.quot.data.additions);
        this.quot.data.additions = this.addbuild.data; //link addition data{}

        this.winbuild.SETtable(this.winbuild.SETtablerow)//this.winbuild.SETtablerow);
        this.gbbuild.SETtable(this.gbbuild.SETtablerow);
        this.addbuild.SETtable(this.addbuild.SETtablerow);

        this.SETcustomer();
		this.SEThome();
        document.getElementById(this.bqdom.id).value = this.quot.id;
        document.addEventListener('change',(ele)=>{
          console.log(this.GETquote());
          this.SAVEquote();
        })
        

        // Add a mutation observer to detect when a child is removed from each table
        const gbtableobserver = this.gbbuild.table;

        const gbobserver = new MutationObserver(() => {
            //console.log('callback that runs when observer is triggered');
            let refreshed = this.gbbuild.REFRESHbuild()
            if (refreshed) {
              this.GETquote()
              this.SAVEquote()
            }
        });

        gbobserver.observe(gbtableobserver, {subtree: true, childList: true});

        // Add a mutation observer to detect when a child is removed from each table
        const wintableobserver = this.winbuild.table;

        const winobserver = new MutationObserver(() => {
            //console.log('callback that runs when observer is triggered');
            let refreshed = this.winbuild.REFRESHbuild()
            if (refreshed) {
              this.GETquote()
              this.SAVEquote()
            }
        });

        winobserver.observe(wintableobserver, {subtree: true, childList: true});

        // Add a mutation observer to detect when a child is removed from each table
        const addtableobserver = this.addbuild.table;

        const addobserver = new MutationObserver(() => {
            //console.log('callback that runs when observer is triggered');
            let refreshed = this.addbuild.REFRESHbuild()
            if (refreshed) {
              this.GETquote()
              this.SAVEquote()
            }
        });

        addobserver.observe(addtableobserver, {subtree: true, childList: true});
    }

    GETquote = ()=>{
      try{
        this.SETsummary();
        //this.SETwinbuild(); //temporary for testing
        //this.SETgbbuild(); //temporary for testing
        this.GETcustomer();
        this.GEThome();
        this.SETpresentation();

      }catch{}
      return this.quot;
    }

    SETquote = (aquote)=>{
      this.quot = beequot(aquote);
      console.log(this.quot);
      document.getElementById(this.bqdom.id).value = this.quot.id;

      this.winbuild.SETwinbuild(this.quot.key,this.quot.data.windows);
      this.gbbuild.SETgbbuild(this.quot.key,this.quot.data.glassblocks);
      this.addbuild.SETaddbuild(this.quot.data.additions);

      this.SETcustomer();

      this.SEThome();
      this.GETquote();
    }

    SETsummary = ()=>{
        this.SETwinsummary();
        this.SETgbsummary();
        this.SETaddsummary();
    }

    SETgbsummary=()=>{
        console.log("Setting glass block summary")
        let list = document.getElementById(this.bqdom.summary.glassblock.list.cont);
        let gbuild = this.quot.data.glassblocks.build;
        console.log("GBUILD IN SET GBSUMMARY", gbuild)

        list.innerHTML = '';
        if(gbuild){
          for(let x=0;x<gbuild.glassblocks.length;x++){
              list.appendChild(this.SETgbsummaryrow(gbuild.glassblocks[x]));
              $(list.lastChild).show();
          }
        }

    }
    SETgbsummaryrow=(gb)=>{
        let trow = document.getElementById(this.bqdom.summary.glassblock.list.row.cont).cloneNode(true);

        trow.id='';
        trow.classList.add(this.bqdom.summary.glassblock.list.row.cont);

        trow.getElementsByClassName(this.bqdom.summary.glassblock.list.row.area)[0].innerText = gb.area || '';
        trow.getElementsByClassName(this.bqdom.summary.glassblock.list.row.width)[0].innerText = gb.width || '';
        trow.getElementsByClassName(this.bqdom.summary.glassblock.list.row.height)[0].innerText = gb.height || '';

        let opts = trow.getElementsByClassName(this.bqdom.summary.glassblock.list.row.options.cont)[0];

        for(let x=0;x<gb.options.length;x++){
            opts.appendChild(document.createElement('div'));
            opts.children[opts.children.length-1].innerText = gb.options[x];
        }

        return trow;
    }

    SETwinsummary=()=>{
        let tiers = document.getElementById(this.bqdom.summary.window.tiers.cont);
        let tiernav = document.getElementById(this.bqdom.summary.window.tiers.nav);

        let wbuild = this.quot.data.windows.build;


        tiers.innerHTML = '';
        tiernav.innerHTML = '';

        if(wbuild){
            for(let x=wbuild.tiers.length-1;0<=x;x--){//for each tier in build
                tiernav.appendChild(document.createElement('div')).innerText = wbuild.tiers[x].tier;
                tiernav.lastChild.addEventListener('click',(ele)=>{ //tier select
                    this.SUMwintoggle(wbuild.tiers[x].tier);
                });

                let tier = tiers.appendChild(document.createElement('div'));
                tier.classList.add(this.bqdom.summary.window.tiers.tier.cont);
                for(let y=0;y<wbuild.tiers[x].windows.length;y++){
                    tier.appendChild(this.SETwinsummaryrow(wbuild.tiers[x].windows[y]));
                }

                $(tier).hide();
            }
            $(tiers.children[0]).show();
            tiernav.children[0].classList.add(this.bqdom.summary.window.tiers.selected);
        }
    }
    SETwinsummaryrow=(wbuild)=>{
        //try{
            let trow = document.getElementById(this.bqdom.summary.window.tiers.tier.row.cont).cloneNode(true);

            trow.id='';
            trow.classList.add(this.bqdom.summary.window.tiers.tier.row.cont);

            trow.getElementsByClassName(this.bqdom.summary.window.tiers.tier.row.style)[0].innerText = wbuild.style || '';
            trow.getElementsByClassName(this.bqdom.summary.window.tiers.tier.row.model)[0].innerText = wbuild.model || '';
            trow.getElementsByClassName(this.bqdom.summary.window.tiers.tier.row.room)[0].innerText = wbuild.room || '';
            trow.getElementsByClassName(this.bqdom.summary.window.tiers.tier.row.location)[0].innerText = wbuild.location || '';
            trow.getElementsByClassName(this.bqdom.summary.window.tiers.tier.row.story)[0].innerText = wbuild.story || '';
            trow.getElementsByClassName(this.bqdom.summary.window.tiers.tier.row.width)[0].innerText = wbuild.width || 0;
            trow.getElementsByClassName(this.bqdom.summary.window.tiers.tier.row.height)[0].innerText = wbuild.height || 0;
            if(!wbuild.maxuinch){
              trow.getElementsByClassName(this.bqdom.summary.window.tiers.tier.row.width)[0].classList.add(this.bqdom.summary.window.tiers.flags.size);
              trow.getElementsByClassName(this.bqdom.summary.window.tiers.tier.row.height)[0].classList.add(this.bqdom.summary.window.tiers.flags.size);;
            }
            let opts = trow.getElementsByClassName(this.bqdom.summary.window.tiers.tier.row.options.cont)[0];
            for(let x=0;x<wbuild.options.length;x++){
                opts.appendChild(document.createElement('div'));
                opts.children[opts.children.length-1].innerText = wbuild.options[x].name || '-';
                if(wbuild.options[x].rate !=0){ //to see if it is included
                    opts.children[opts.children.length-1].classList.add(this.bqdom.summary.window.tiers.tier.row.options.included);
                }else{
                    opts.children[opts.children.length-1].classList.add(this.bqdom.summary.window.tiers.tier.row.options.excluded);
                }
            }

            $(trow).show();
            return trow;
        //}catch{console.log('failed to write')};
        return document.createElement('div');
    }
    SUMwintoggle=(tier)=>{
        let tiers = document.getElementById(this.bqdom.summary.window.tiers.cont);
        let tnav = document.getElementById(this.bqdom.summary.window.tiers.nav);

        for(let x=tiers.children.length-1;0<=x;x--){

            if(tnav.children[x].innerText == tier){
                $(tiers.children[x]).show();
                tnav.children[x].classList.add(this.bqdom.summary.window.tiers.selected);
            }else{
                $(tiers.children[x]).hide();
                tnav.children[x].classList.remove(this.bqdom.summary.window.tiers.selected);
            }

        }
    }

    SETaddsummary=()=>{
        let list = document.getElementById(this.bqdom.summary.additions.list.cont);
        //console.log('Additions: ',this.quot.data.additions);
        let addbuild = this.quot.data.additions.build;

        list.innerHTML = '';
        if(addbuild){
          for(let x=0;x<addbuild.length;x++){
              list.appendChild(this.SETaddsummaryrow(addbuild[x]));
              $(list.lastChild).show();
          }
        }

    }
    SETaddsummaryrow=(add)=>{
        let trow = document.getElementById(this.bqdom.summary.additions.list.row.cont).cloneNode(true);

        trow.id='';
        trow.classList.add(this.bqdom.summary.additions.list.row.cont);

        trow.getElementsByClassName(this.bqdom.summary.additions.list.row.desc)[0].innerText = add.desc || '';
        trow.getElementsByClassName(this.bqdom.summary.additions.list.row.amount)[0].innerText = add.amount || '';

        return trow;
    }

    /*  BUILT FOR DEV ONLY ////////////////////////
    */
    SETwinbuild=()=>{
        let wdom = document.getElementById('winbuild-display');

        wdom.innerHTML='';

        let wt = document.createElement('div');

        wt.appendChild(document.createElement('div'));
        wt.children[wt.children.length-1].innerText = "HOURS";

        wt.appendChild(document.createElement('div'));
        wt.children[wt.children.length-1].innerText = this.quot.data.windows.build.info.labor.hours;
        wt.appendChild(document.createElement('div'));
        wt.children[wt.children.length-1].innerText = "COST | " + Number(this.quot.data.windows.build.info.labor.cost).toFixed(2);
        wdom.appendChild(wt);

        for(let x=0;x<this.quot.data.windows.build.tiers.length;x++){
            wt = document.createElement('div');
            wt.appendChild(document.createElement('div'));
            wt.children[wt.children.length-1].innerText = this.quot.data.windows.build.tiers[x].tier;
            wt.appendChild(document.createElement('div'));
            wt.children[wt.children.length-1].innerText =  "COST | " + Number(this.quot.data.windows.build.tiers[x].cost).toFixed(2);
            wt.appendChild(document.createElement('div'));
            wt.children[wt.children.length-1].innerText =  "PRICE | " +Number(this.quot.data.windows.build.tiers[x].price).toFixed(2);
            wdom.appendChild(wt);
        }
    }
    SETgbbuild=()=>{
        let gdom = document.getElementById('gbbuild-display');
        gdom.innerHTML='';
        let gt = document.createElement('div');

        gt.appendChild(document.createElement('div'));
        gt.children[gt.children.length-1].innerText = "COST | " + Number(this.quot.data.glassblocks.build.info.cost).toFixed(2);

        gt.appendChild(document.createElement('div'));
        gt.children[gt.children.length-1].innerText = 'PRICE | ' + Number(this.quot.data.glassblocks.build.info.price).toFixed(2);

        gdom.appendChild(gt);

    }
    ///////////////////////////////////////////////

    /*  CUSTOMER STUFF ////////////////////////////
    */
    SETcustomer=()=>{
      //console.log(this.quot.customer)
      document.getElementById(this.bqdom.customer.id).value = this.quot.customer.id || '';
      document.getElementById(this.bqdom.customer.fname).value = this.quot.customer.fname || '';
      document.getElementById(this.bqdom.customer.lname).value = this.quot.customer.lname || '';

      document.getElementById(this.bqdom.customer.street).value = this.quot.customer.address.street || '';
      document.getElementById(this.bqdom.customer.suite).value = this.quot.customer.address.suite || '';
      document.getElementById(this.bqdom.customer.city).value = this.quot.customer.address.city || '';
      document.getElementById(this.bqdom.customer.state).value = this.quot.customer.address.state || '';
      document.getElementById(this.bqdom.customer.zip).value = this.quot.customer.address.zip || '';

      document.getElementById(this.bqdom.customer.phone).value = this.quot.customer.contact.phone || '';
      document.getElementById(this.bqdom.customer.email).value = this.quot.customer.contact.email || '';

      document.getElementById(this.bqdom.customer.notes).value = this.quot.notes || '';
    }
    GETcustomer=()=>{

      this.quot.customer.id = document.getElementById(this.bqdom.customer.id).value;
      this.quot.customer.fname=document.getElementById(this.bqdom.customer.fname).value;
      this.quot.customer.lname=document.getElementById(this.bqdom.customer.lname).value;

      this.quot.customer.address.street=document.getElementById(this.bqdom.customer.street).value;
      this.quot.customer.address.suite=document.getElementById(this.bqdom.customer.suite).value;
      this.quot.customer.address.city=document.getElementById(this.bqdom.customer.city).value;
      this.quot.customer.address.state=document.getElementById(this.bqdom.customer.state).value;
      this.quot.customer.address.zip=document.getElementById(this.bqdom.customer.zip).value;


      this.quot.address.street=document.getElementById(this.bqdom.customer.street).value;
      this.quot.address.suite=document.getElementById(this.bqdom.customer.suite).value;
      this.quot.address.city=document.getElementById(this.bqdom.customer.city).value;
      this.quot.address.state=document.getElementById(this.bqdom.customer.state).value;
      this.quot.address.zip=document.getElementById(this.bqdom.customer.zip).value;

      this.quot.customer.contact.phone=document.getElementById(this.bqdom.customer.phone).value;
      this.quot.customer.contact.email=document.getElementById(this.bqdom.customer.email).value;


      this.quot.notes=document.getElementById(this.bqdom.customer.notes).value;

      //console.log(this.quot.customer);
    }
    ///////////////////////////////////////////////

    /*  HOME STUFF ////////////////////////////
    */
    SEThome=()=>{
      document.getElementById(this.bqdom.home.sf).value=this.quot.home.sf||'';
      document.getElementById(this.bqdom.home.atticsf).value=this.quot.home.atticsf||'';
      document.getElementById(this.bqdom.home.roofmake).value=this.quot.home.roofmake||'';

      document.getElementById(this.bqdom.home.occupants).value=this.quot.home.occupants||'';
      document.getElementById(this.bqdom.home.direction).value=this.quot.home.direction||'';
      document.getElementById(this.bqdom.home.heatload).value=this.quot.home.heatload||'';
      document.getElementById(this.bqdom.home.coolload).value=this.quot.home.coolload||'';
    }
    GEThome=()=>{
      //console.log(this.quot.home.sf);
      this.quot.home.sf=document.getElementById(this.bqdom.home.sf).value;
      this.quot.home.atticsf=document.getElementById(this.bqdom.home.atticsf).value;
      this.quot.home.roofmake=document.getElementById(this.bqdom.home.roofmake).value;

      this.quot.home.occupants=document.getElementById(this.bqdom.home.occupants).value;
      this.quot.home.direction=document.getElementById(this.bqdom.home.direction).value;
      this.quot.home.heatload=document.getElementById(this.bqdom.home.heatload).value;
      this.quot.home.coolload=document.getElementById(this.bqdom.home.coolload).value;
      //console.log(this.quot.customer)
    }
    ///////////////////////////////////////////////

    /*  KEY STUFF /////////////////////////////////
    */
    REFRESHkey=(nkey=null)=>{
      if(nkey){
        this.winbuild.key.SETkey(nkey);
        this.gbbuild.key.SETkey(nkey);
        this.quot.key = nkey;
      }
    }

    /*  PRESENTATION STUFF  //////////////////////
    */
    SETpresentation = ()=>{
      this.PRESENTinvest(this.PRESENTwinbuild(),this.PRESENTgbbuild()+this.PRESENTaddbuild());
      this.PRESENTinfo();
    }

    PRESENTinfo = ()=>{
      //try{
        document.getElementById(this.bqdom.present.info.title).innerText=(this.quot.customer.fname||'') + ' ' + (this.quot.customer.lname||'');
        document.getElementById(this.bqdom.present.info.name).innerText=(this.quot.customer.fname||'') + ' ' + (this.quot.customer.lname||'');
        document.getElementById(this.bqdom.present.info.address).innerText=this.quot.address.street||'';
        document.getElementById(this.bqdom.present.info.csz).innerText=(this.quot.address.city||'')+', '+(this.quot.address.state||'')+' '+(this.quot.address.zip||'');
        document.getElementById(this.bqdom.present.info.phone).innerText=this.quot.customer.contact.phone||'';
        document.getElementById(this.bqdom.present.info.email).innerText=this.quot.customer.contact.email||'';
      // /}catch{}
    }
    PRESENTgbbuild = ()=>{
      try{
        let gcont = document.getElementById(this.bqdom.present.glassblocks.list.cont);
        gcont.innerHTML = '';
        let gbuild = this.quot.data.glassblocks.build;

        if(gbuild.glassblocks.length>0){//hide block if no items
          $(document.getElementById(this.bqdom.present.additions.cont)).show();
        }else{$(document.getElementById(this.bqdom.present.additions.cont)).hide();}

        for(let x=0;x<gbuild.glassblocks.length;x++){
          gcont.appendChild(document.createElement('div'));
          gcont.children[gcont.children.length-1].innerText = gbuild.glassblocks[x].area;
          //could add a closs
        }
        return gbuild.info.price || 0;
      }catch{return 0}
    }

    PRESENTwinbuild = ()=>{
      let wbuild = this.quot.data.windows.build;
      let prices = [];
      let totuinch = 0;
      //set tier titles / headers
      let tcont = document.getElementById(this.bqdom.present.windows.tiers.cont);
      let trimcont = document.getElementById(this.bqdom.present.windows.trims.list);

      tcont.innerHTML = '';
      trimcont.innerHTML= '';

      this.PRESENTresetwinopts();
      document.getElementById('quote-window-number').innerText = wbuild.tiers[0].windows.length || 0;

      for(let x=wbuild.tiers.length-1;0<=x;x--){
        let tblock = document.createElement('div');
        tblock.classList.add(this.bqdom.present.windows.tiers.item.cont);
        tblock.appendChild(document.createElement('span'));
        tblock.children[tblock.children.length-1].innerText = wbuild.tiers[x].tier;
        tblock.children[tblock.children.length-1].classList.add(this.bqdom.present.windows.tiers.item.name);
        tblock.appendChild(document.createElement('span'));
        tblock.children[tblock.children.length-1].innerText = wbuild.tiers[x].model;
        tblock.children[tblock.children.length-1].classList.add(this.bqdom.present.windows.tiers.item.model);

        tcont.appendChild(tblock);

        prices.push(wbuild.tiers[x].price);

        for(let y=0;y<wbuild.tiers[x].windows.length;y++){//collect options
          this.PRESENTwinopts(wbuild.tiers[x].windows[y].options);
          //total uinch of windows (do not need to do for all tiers)
          if(x==0){
            totuinch += (Number(wbuild.tiers[x].windows[y].width)+Number(wbuild.tiers[x].windows[y].height) || 0) //only need to collect the united inch once
          }
        }
      }

      //set trim prices
      for(let x=0;x<this.quot.key.info.trimtab.heads.length;x++){

        let fin = this.winbuild.key.GETfinprice(this.quot.key.info.trimtab.vals[x]*totuinch,1066); //to add the finance price to the trim prices
        let row = document.createElement('div');
        row.classList.add(this.bqdom.present.windows.trims.item.cont);

        row.appendChild(document.createElement('div'));
        row.children[row.children.length-1].innerText = this.quot.key.info.trimtab.heads[x] + ' - Add:';

        row.appendChild(document.createElement('div'));
        row.children[row.children.length-1].innerText = Number(fin.price).toFixed(0);

        var check = document.createElement("div");
        check.classList.add('vg-checkbox');

        check.addEventListener('click',(ele)=>{

          if(ele.target.classList.contains('vg-checkbox-checked')){
            ele.target.classList.remove('vg-checkbox-checked');
            this.PRESENTtoggletrim(ele.target.parentNode,fin.term,false);
          }else{
            ele.target.classList.add('vg-checkbox-checked');
            this.PRESENTtoggletrim(ele.target.parentNode,fin.term,true);
          }
        });
        row.appendChild(check);
        trimcont.appendChild(row);
      }
      return prices;
    }
    PRESENTresetwinopts = ()=>{
      for(let o in this.bqdom.present.windows.options.items){
        if(o!='list'){$(document.getElementById(this.bqdom.present.windows.options.items[o])).hide();}

      }
    }
    PRESENTwinopts = (wopts)=>{
      for(let x=0;x<wopts.length;x++){
        for(let o in this.bqdom.present.windows.options.items){

          if(wopts[x].name == o && wopts[x].rate != 0){
            $(document.getElementById(this.bqdom.present.windows.options.items[o])).show();
          }
        }
      }
    }
    PRESENTaddbuild = ()=>{
      //try{
        let acont = document.getElementById(this.bqdom.present.additions.list.cont);
        let abuild = this.quot.data.additions.build;
        let atotal = 0;
        acont.innerHTML = '';
        if(abuild.length>0){//hide block if no items
          $(document.getElementById(this.bqdom.present.additions.cont)).show();
        }else{$(document.getElementById(this.bqdom.present.additions.cont)).hide();}

        for(let x=0;x<abuild.length;x++){
          acont.appendChild(document.createElement('div'));
          acont.children[acont.children.length-1].innerText = abuild[x].desc ||'';
          atotal += (Number(abuild[x].amount) || 0);
        }
        return atotal;
      //}catch{return 0;}

    }

    PRESENTinvest = (prices,othprice)=>{
      let invcont = document.getElementById(this.bqdom.present.invest.list.cont);
      invcont.innerHTML = '';
      for(let x=0;x<prices.length;x++){
        let fin = this.winbuild.key.GETfinprice(prices[x]+othprice,1066);
        let invitem = document.createElement('div')
        invitem.classList.add(this.bqdom.present.invest.list.item.cont);
        invitem.appendChild(document.createElement('div')).classList.add(this.bqdom.present.invest.list.item.monthly);
        invitem.children[invitem.children.length-1].innerText = Number(fin.monthly).toFixed(0);

        invitem.appendChild(document.createElement('div')).classList.add(this.bqdom.present.invest.list.item.title);
        invitem.children[invitem.children.length-1].appendChild(document.createElement('div')).innerText = '0% Down Today';
        invitem.children[invitem.children.length-1].appendChild(document.createElement('div')).innerText = fin.title;

        invitem.appendChild(document.createElement('div')).classList.add(this.bqdom.present.invest.list.item.total);
        invitem.children[invitem.children.length-1].innerText = Number(fin.price).toFixed(0);
        invcont.appendChild(invitem);
      }
    }

    PRESENTtoggletrim = (ele,term,add)=>{
      let adjust = Number(ele.children[1].innerText);
      let invlist = document.getElementById(this.bqdom.present.invest.list.cont)
      if(!add){
        adjust*=(-1);
      }
      for(let x=0;x<invlist.children.length;x++){
        invlist.children[x].getElementsByClassName(this.bqdom.present.invest.list.item.total)[0].innerText=Number(invlist.children[x].getElementsByClassName(this.bqdom.present.invest.list.item.total)[0].innerText)+adjust;
        invlist.children[x].getElementsByClassName(this.bqdom.present.invest.list.item.monthly)[0].innerText = Number(Number(invlist.children[x].getElementsByClassName(this.bqdom.present.invest.list.item.total)[0].innerText)/term).toFixed(0);
      }
    }

    SAVEquote = ()=>{//Save Work Order to localStorage
      //console.log('Saveing Quote: ',this.quot);
      this.quot.id = document.getElementById(this.bqdom.id).value;
      localStorage.setItem(quotels.curquote,JSON.stringify(this.quot));
      var uqlist = JSON.parse(localStorage.getItem(quotels.uqlist));
      if(this.quot){
        if(uqlist){
          for(let x=0;x<uqlist.length;x++){
            if(this.quot.id == uqlist[x].id){
              //update the wo
              uqlist[x] = this.quot;
              localStorage.setItem(quotels.uqlist,JSON.stringify(uqlist)); //update local storage
              return true;
            }
          }
          uqlist.push(this.quot);
          localStorage.setItem(quotels.uqlist,JSON.stringify(uqlist)); //update local storage
          return true;
        }else{ //wolist has not been initialized
          uqlist = [];
          uqlist.push(this.quot);
          localStorage.setItem(quotels.uqlist,JSON.stringify(uqlist));
          return true;
        }
      }else{return false}
    }

}

module.exports = {
    qvdom,
    BEEQuote,
    beequot
}
