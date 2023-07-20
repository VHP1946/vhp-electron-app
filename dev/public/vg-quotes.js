
var {ObjList}=require('./repo/tools/box/vg-lists.js');
var {quotesls} = require('./gui/storage/lstore.js')
var {qdashroutes}=require('../bin/routes.js');
/* MOVE the following to a seperate file for display tables ///////////////////
*/
var gentabdom = {
  table:'general-table',
  header:'general-table-header',
  row:'general-table-row'
}

var LOADgentable=(llist,tablename,headmap,rowmap,rowmapper=(obj,map,row)=>{return null},roweve=(ele)=>{})=>{
  let tablespot = document.getElementById(tablename);
  tablespot.innerHTML='';
  var newspot = tablespot.appendChild(document.createElement('div'));
  tablespot.lastChild.classList.add(gentabdom.header);
  for (let j = 0; j < headmap.length; j++){
    newspot.appendChild(document.createElement('div')).innerText = headmap[j];
  }

  for (let i = 0; i < llist.length; i++){
    newspot = tablespot.appendChild(document.createElement('div'));
    tablespot.lastChild.classList.add(gentabdom.row);
    newspot.addEventListener('click',roweve);
    for (let j = 0; j < headmap.length; j++){
      newspot.appendChild(document.createElement('div'));
    }
    rowmapper(llist[i],rowmap,newspot);
  }
}

///////////////////////////////////////////////////////////////////////////////

var qadom = { //Quote Action DOM
  cont:'dash-container',
  filter:{
    cont:'dash-quote-table-descr',
    form:{
      cont:'quote-table-filters',
      inputs:{
        quotename:'quote-filter-custname',
        quotenum:'quote-filter-quotenum',
        address:'quote-filter-address',
        fromdate:'quote-filter-fromdate',
        todate:'quote-filter-todate'
      },
      actions:{
        clear:'clear-filter',
        run:'start-search'
      }
    },
    specials:{
      open:{
        date:'opendate'
      },
      close:{
        date:'closedate'
      },
      submit:{
        date:'subdate'
      },
      inprogress:{
        date:'apprdate'
      }
    }
  },
  info:{
    cont:'dash-quote-action-center',
    actions:{
      createquote:'quote-action-createnewquote',
      resumequote:'quote-action-resumelastquote'
    },
    summary:{
      lastquote:'action-center-lastquote'
    }
  }
}

var qpdom = {  //Quote Preview DOM
  cont: 'vg-center-info-preview',
  value:{
    cname: 'preview-value-cname',
    jaddy: 'preview-value-jaddy',
    caddy: 'preview-value-caddy',
    phone1: 'preview-value-phone1',
    phone2: 'preview-value-phone2',
    email: 'preview-value-email'
  }
}


// Quote Action Center functions ///////////////////////////////////

var QuoteActionCenterSetup=()=>{
  document.getElementById(qadom.info.actions.createquote).addEventListener('dblclick',(ele)=>{
    ipcRenderer.send(qdashroutes.createquote,'Request To Create Quote..');
  });
  document.getElementById(qadom.info.actions.resumequote).addEventListener('dblclick',(ele)=>{
    let lquote = JSON.parse(localStorage.getItem(quotesls.lastquote));
    if(lquote&&lquote!=undefined){
      localStorage.setItem(quotesls.quotetoload,JSON.stringify(lquote));
      ipcRenderer.send(qdashroutes.loadquote,'Request to Load Last Quote');
    }else{
      DropNote('tr','No Quote to Load','red');
    }
  });
}
////////////////////////////////////////////////////////////////////

// Quote Table Filter functions ////////////////////////////////////

var GETquotefilters=()=>{
  let qf = {};
  for(let f in qadom.filter.form.inputs){
    qf[f]=document.getElementById(qadom.filter.form.inputs[f]).value;
  }
  return qf;
}
var CLEARquotefilters=()=>{ //clears the filter form
  for(let f in qadom.filter.form.inputs){
    try{document.getElementById(qadom.filter.form.inputs[f]).value="";}
    catch{document.getElementById(qadom.filter.form.inputs[f]).valueAsDate=null;}
  }
}
var RUNquotefilters=()=>{

}

var QuoteFilterSetup=(Qlists)=>{
  document.getElementById(qadom.filter.form.actions.clear).addEventListener('dblclick',(ele)=>{
    CLEARquotefilters();
    Qlists.REFRESHtables();
  });
  document.getElementById(qadom.filter.form.actions.run).addEventListener('dblclick',(ele)=>{
    Qlists.FILTERtables();
  });
}
////////////////////////////////////////////////////////////////////


var qtdom={ //Quote Table DOM
  nav:{
    selected:'quote-table-switch-selected',
    buttons:{
      open:'quote-table-switch-open',
      close:'quote-table-switch-closed',
      submit:'quote-table-switch-submitted',
      inprogress:'quote-table-switch-inprogress'
    }
  },
  tables:{
    open:'quote-table-open',
    close:'quote-table-closed',
    submit:'quote-table-submitted',
    inprogress:'quote-table-ip',
  },
  flts:{
    open:{status:'O'},
    close:{status:'C'},
    submit:{status:'S'},
    inprogress:{status:'I'}
  },
  rows:{
    open:['id','name','street','opendate'],
    close:['id','name','street','closedate'],
    submit:['id','name','street','subdate'],
    inprogress:['id','name','street','apprdate']
  },
  heads:{
    open:['ID','NAME','ADDRESS','OPENED'],
    close:['ID','NAME','ADDRESS','CLOSED'],
    submit:['ID','NAME','ADDRESS','SUBMITTED'],
    inprogress:['ID','NAME','ADDRESS','APPROVED']
  }
}

class QuoteTables extends ObjList{
    constructor(qlist,dom){
      super(qlist);

      this.ctable = null; //the current displayed table
      this.dom = dom;

      for(let n in this.dom.nav.buttons){ //setup tables nav
        document.getElementById(this.dom.nav.buttons[n]).addEventListener('click',(ele)=>{
          this.clearnavselected();
          this.hidetables();
          ele.target.classList.add(this.dom.nav.selected);

          this.ctable=document.getElementById(this.dom.tables[n]); //set current table

          $(this.ctable).show();
        });
      }

      ///Preview Close Button
      document.getElementById('close-preview').addEventListener('click',(ele)=>{
        $(document.getElementById(qpdom.cont)).hide();
      });
      document.getElementById('open-cur-quote').addEventListener('click',(ele)=>{
        let id = JSON.parse(localStorage.getItem(quotesls.quotetoload)).id;
        if(id&&id!=undefined){
          ipcRenderer.send(qdashroutes.loadquote,{id:id});
        }else{DropNote('tr','No Quote To Load','yellow')}
        $(document.getElementById(qpdom.cont)).hide();
      });

    }

    REFRESHtables=()=>{//Sorts(status) and displays to dom
      for(let t in this.dom.tables){
        LOADgentable(
          this.TRIMlist(this.dom.flts[t]),
          this.dom.tables[t],
          this.dom.heads[t],
          this.dom.rows[t],
          this.quotelistrowmap,
          this.quoterowpreview);
        }
    }
    FILTERtables=()=>{//use inputs in filter form
      let fltob = GETquotefilters();

      //adjust dates FROM - TO
      fltob.fromdate = fltob.fromdate==''?new Date('1900-1-1'):new Date(fltob.fromdate);
      fltob.todate = fltob.todate==''?new Date():new Date(fltob.todate);

      for(let t in this.dom.tables){
        let flist = this.TRIMlist({
          id:fltob.quotenum,
          name:fltob.quotename,
          street:fltob.address,
          status:this.dom.flts[t].status
        },true);

        let fflist = []; // hold the second filtered list

        for(let x=0;x<flist.length;x++){ //loop through the trimmed list
          let spcpass = false;

          for(let s in qadom.filter.specials[t]){
            switch(s){
              case 'date':{
                //console.log("FROM >",fltob.fromdate);
                //console.log("TO >",fltob.todate);
                let cdate = new Date(flist[x][qadom.filter.specials[t][s]]);
                if(cdate >= fltob.fromdate&&cdate<=fltob.todate){spcpass = true;}
              }
            }
          }
          if(spcpass){fflist.push(flist[x]);}
        }
        LOADgentable(fflist,this.dom.tables[t],this.dom.heads[t],this.dom.rows[t],this.quotelistrowmap,this.quoterowpreview);
      }
    }

    // PRIVATE FUNCTIONS ////////////////////////////////////////////////////
    quoterowpreview=(ele)=>{
      var num = ele.path[1].classList.contains(gentabdom.row)?1:0;
      var tempquote = this.TRIMlist({id:ele.path[num].children[0].innerText})[0];

      localStorage.setItem(quotesls.quotetoload,JSON.stringify(tempquote));

      document.getElementById(qpdom.value.cname).innerText = tempquote.customer.name;
      document.getElementById(qpdom.value.jaddy).innerText = tempquote.street + tempquote.unit + ', ' + tempquote.city + ', ' + tempquote.state + ', ' + tempquote.zip;
      document.getElementById(qpdom.value.caddy).innerText = tempquote.customer.street + tempquote.customer.unit + ', ' + tempquote.customer.city + ', ' + tempquote.customer.state + ', ' + tempquote.customer.zip;
      document.getElementById(qpdom.value.phone1).innerText = tempquote.customer.phone;
      document.getElementById(qpdom.value.email).innerText = tempquote.customer.email;

      $(document.getElementById(qpdom.cont)).show();
    }

    quotelistrowmap=(qlr,qrmap,row)=>{// map to put quote in a table row
        for(let x=0;x<qrmap.length;x++){
        row.children[x].innerText = qlr[qrmap[x]]!=undefined?qlr[qrmap[x]]:'';
      }
    }

    // Table Navigation ///////////////////////////////////////
    clearnavselected=()=>{//Clears the selected class from the nav buttons
      for(let n in this.dom.nav.buttons){
        document.getElementById(this.dom.nav.buttons[n]).classList.remove(this.dom.nav.selected);
      }
    }
    hidetables=()=>{//Hide all the table views
      for(let t in this.dom.tables){
        $(document.getElementById(this.dom.tables[t])).hide();
      }
    }
    ///////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////
}

module.exports = {
  qtdom,
  QuoteTables,
  QuoteFilterSetup,
  QuoteActionCenterSetup
}
