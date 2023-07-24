

const {ipcRenderer} = require('electron');

var {quotels}=require('../js/lstore.js');
var {dashroutes}=require('../js/routes.js');

var {stdbook}=require('../bin/repo/gui/js/layouts/vg-stdbook.js');

var {WinBuild}=require('../js/winquote.js');
var {GBlockBuild}=require('../js/gbquote.js');
var {AddBuild}=require('../js/additquote.js');
var {InsulBuild}=require('../js/insulquote.js');

var {WindowKey}=require('../js/keymaker.js');

var {qvdom,BEEQuote,beequot}=require('../js/beequote.js');
var {vudom,SETupdownside,CollapseEdge}=require('../js/vg-util-updownside.js');
var {DropNote}=require('../js/vg-poppers.js');

var refreshkey = false;
var beeq = null; //BEEquote class object
var insq = null;
var pkey = {};

//drop down dash container > children names
var dashdom = {
  cont:'quote-dash-cont',
  buttons:{
    editToggle:'quote-dash-toggle'
  },
  list:{
    cont:'quote-dash-list',
    item:{
      cont:'vg-wo-item',
      num:'vg-wo-item-num',
      name:'vg-wo-item-name',
      address:'vg-wo-item-address'
    }
  }
}

/*  Load the users quotes to the list
    PASS:
    - aquote = a Quote class
      *must have .SETquote() (for when a quote was selected)
*/
var LOADqlist = (aquote)=>{
  let uqlist = JSON.parse(localStorage.getItem(quotels.uqlist));
  //console.log('USER LIST 2: ',uqlist);
  let dlist = document.getElementById(dashdom.list.cont);
  dlist.innerHTML = '';
  if(uqlist){
    for(let x=0;x<uqlist.length;x++){
      let item = document.createElement('div');
      item.classList.add(dashdom.list.item.cont);
      item.addEventListener('click',(ele)=>{
        let qlist = JSON.parse(localStorage.getItem(quotels.uqlist));
        for(let y=0;y<qlist.length;y++){
          //search for a quote.id from the from the selected
          if(qlist[y].id == ele.target.parentNode.getElementsByClassName(dashdom.list.item.num)[0].innerText){

            aquote.SETquote(qlist[y]); //setup a new quote

            DropNote('tr','QUOTE LOADING!','green');
            $(document.getElementById(dashdom.cont)).hide();
            CollapseEdge('top');
          }
        }
      });
      // Quote values to display
      item.appendChild(document.createElement('div')).innerText = uqlist[x].id;
      item.children[item.children.length-1].classList.add(dashdom.list.item.num);

      item.appendChild(document.createElement('div')).innerText = uqlist[x].customer.lname;
      item.children[item.children.length-1].classList.add(dashdom.list.item.name);

      item.appendChild(document.createElement('div')).innerText = uqlist[x].address.street;
      item.children[item.children.length-1].classList.add(dashdom.list.item.address);
      ////////////////////////////////////////////////////////////////////////////////////////

      dlist.appendChild(item);
    }
  }
}

/*Get an upto date price key
*/
ipcRenderer.send(dashroutes.getkey,'GET');

ipcRenderer.on(dashroutes.getkey,(eve,data)=>{
    if(data){
      if(!refreshkey){
        DropNote('tr','KEY IS UPDATED!','green');
        pkey = data; //set the current key
        localStorage.setItem(quotels.qkey,JSON.stringify(pkey));

        let tquot = JSON.parse(localStorage.getItem(quotels.curquote));

        if(tquot !=undefined || tquot){
            if(!tquot.key.info){tquot.key=pkey}
        }else{
            tquot = beequot({key:pkey});
        }
        beeq = new BEEQuote(tquot);
        beeq.GETquote();

        insq = new InsulBuild(beeq.quot.key.insulation,null); //setup insulation

      }else{
        beeq.REFRESHkey(data);
        beeq.gbbuild.REFRESHbuild();
        beeq.winbuild.REFRESHbuild();
        localStorage.setItem(quotels.curquote,JSON.stringify(beeq.GETquote())); //save the quote to localstorage

        insq.key = beeq.quot.key.insulation;

        refreshkey = false;
        DropNote('tr','KEY IS UPDATED!','green');
      }
    }else{
      DropNote('tr','KEY NOT FOUND...','red');
      DropNote('tr','USING OLD KEY...','red');
    }
    console.log("BEEQ::::::::", beeq)
    LOADqlist(beeq); //set

    console.log(data);
});

let mview = new stdbook(qvdom.quote.pages.views,qvdom.quote.nav); //main nav view

var prsdom = {
    const:'present-cont',
    header:'present-header',
    title:'present-title',
}

LOADqlist(beeq); //set

document.getElementById(qvdom.quote.pages.customer.save).addEventListener('click',(ele)=>{
  beeq.SAVEquote();
  LOADqlist(beeq);

  DropNote('tr','SAVING...','green');
});
document.getElementById(qvdom.quote.pages.customer.delete).addEventListener('click',(ele)=>{

  DropNote('tr','QUOTE DELETED...','red');
});
document.getElementById(qvdom.quote.pages.customer.close).addEventListener('click',(ele)=>{
  beeq.SAVEquote();
  //load an empty quote
  DropNote('tr','QUOTE CLEARED...','green');
  beeq.SETquote({key:JSON.parse(localStorage.getItem(quotels.qkey))});

});
document.getElementById(qvdom.quote.pages.summary.print).addEventListener('click',(ele)=>{
  ipcRenderer.send('print-screen');
});
document.getElementById(qvdom.quote.pages.present.print).addEventListener('click',(ele)=>{
  ipcRenderer.send('print-screen');
});
document.addEventListener('change',(ele)=>{
  LOADqlist(beeq);
})
//  refresh key
document.getElementById('q-refresh-key').addEventListener('click',(ele)=>{
  refreshkey = true;
  ipcRenderer.send(dashroutes.getkey,'REFRESH');

  DropNote('tr','REQUESTING KEY...','yellow');
})
window.addEventListener('beforeunload',(ele)=>{
    //save the quote
});
document.getElementById(dashdom.buttons.editToggle).addEventListener('click',(ele)=>{
  var dcont = document.getElementById(dashdom.cont);
  if($(dcont).is(':Visible')){
    $(dcont).hide();
  }else{$(dcont).show();}
});

// Info Toggle Buttons
document.getElementById(qvdom.quote.pages.navbar.info).addEventListener('click',(ele)=>{disappear(qvdom.quote.pages.navbar.ibox)});
document.getElementById(qvdom.quote.pages.customer.info).addEventListener('click',(ele)=>{disappear(qvdom.quote.pages.customer.ibox)});
document.getElementById(qvdom.quote.pages.summary.info).addEventListener('click',(ele)=>{disappear(qvdom.quote.pages.summary.ibox)});
document.getElementById(qvdom.quote.pages.present.info).addEventListener('click',(ele)=>{disappear(qvdom.quote.pages.present.ibox)});

// Visibility Toggle Function
function disappear(box){
  var box = document.getElementById(box);
  if($(box).is(':visible')){
    $(box).hide();
  }else{
    $(box).show();
  }
}

SETupdownside(true,false,false,false);
