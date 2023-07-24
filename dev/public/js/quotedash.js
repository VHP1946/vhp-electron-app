const {ipcRenderer}=require('electron');

const $ = require('jquery');

var {quot,
     Quotes } = require('../../repo/toolbox/things/vogel-quote.js');
const { dashroutes } = require('./routes.js');
const { winquote } = require('./winquote.js'); /*need to remove*/

/* QUOTE DASH ///////////////////////////////////////////////////////////////////////////////////////////////////
    This file will hold everything needed to display quotes for
     a specific user(s). It will have 2 main parts:
        - Summary (a place to summarize user activity)
        - Tables (multiple tables with filtered views)

    In this file:
        - qddom = used to store ids/classes for dom objects
        - QuoteDash = class (used with qddom) to generate and
            handle the quote display and navigation.
*/


var shrtdate=(d)=>{
    if(!d || d==''){return '';}
    let td = new Date(d);
    return `${td.getDate()}-${td.getMonth()+1}-${td.getFullYear()}`;
}

/* QDDOM
    Object holding all needed information to work with
     the quote dash dom.
*/
var qddom = {
    cont:'quote-dash-container', //container for quote dash
    nav:{
        cont: 'quote-table-nav',
        buttons:{
            newquote:'quote-action-createnewquote',
            lastquote:'quote-action-resumelastquote'
        }
    },
    summary:{
    },

    /* Referal Table Views  //////////////////////////////////////////
    //////////////////////////////////////////////////////////////////
        Organized to work with
    */
    qview:{
        /* This view represents differently sorted
        */
        utils:{ //names used by all views
            switchselected : 'quote-table-switch-selected',
            datalist:{ //datalist for input fields
            },
            userfilters:{ //User input fields that filter
            }
        },

        /* Relative Objects //////////////////////////////////

        */
        open: 'open',
        closed: 'closed',

        views:{ //table container names
            open: 'quote-table-open',
            closed: 'quote-table-closed',
        },
        swtchs:{ //buttons to switch between tables
            open: 'quote-table-switch-open',
            closed:'quote-table-switch-closed'
        },
        tabmap:{ //Table Headers to include
            open: {
                titles:[
                    'Quote #',
                    'Name',
                    'Address',
                    'Cust Name',
                    'Create Date',
                    'Changed Date'
                ],
                rows: (q)=>{
                    if(!q){q = rrquot();}
                    return [
                        q.id,
                        q.name,
                        q.address.street,
                        q.customer.lname + ', ' + q.customer.fname,

                        shrtdate(q.opndate),
                        shrtdate(q.chngdate)
                    ]
                }
            },
            closed: {
                titles:[
                    'Quote #',
                    'Name',
                    'Address',
                    'Cust Name',
                    'Create Date',
                    'Changed Date'
                ],
                rows: (q)=>{
                    if(!q){q = rrquot();}
                    return [
                        q.id,
                        q.name,
                        q.address.street,
                        q.customer.lname + ', ' + q.customer.fname,
                        shrtdate(q.opndate),
                        shrtdate(q.chngdate)
                    ]
                }
            }
        },
        action:{
            open: (ele)=>{console.log('open');},
            close: (ele)=>{console.log('close');}
        }
    }
}

/*  Quotes Display ///////////////////////////////////////////////////////////////////////////////////
*/
class QuoteDisplay extends Quotes{
    /* Contstructor /////////////////////////////////////////////////////
    */
    constructor(quotList,quotView){
        super(quotList);
        this.qtable = null; //table with data
        console.log(quotView);
        if(quotView && qddom.qview.views[quotView] && document.getElementById(qddom.qview.views[quotView])){
            this.qview = quotView;
            this.qtable = document.getElementById(qddom.qview.views[this.qview]);
        }else{console.log('Check ' + this.qview + ' view dom name...')}

        this.SetTable(); //set the table
    }

    /* Load Referal Table ///////////////////////////////////////////////
        Loads a table element with rows of data from rlist into
        the table named rtable.
    */
    SetTable = ()=>{
        let trow; //temp row
        let tdat; //temp dat

        if(this.qtable){
            this.qtable.innerHTML = '';

            for(let x=-1;x<this.qlist.length;x++){ //loop through array of objects
                trow = document.createElement('tr');
                let drow;

                if(x == -1){drow = qddom.qview.tabmap[this.qview].titles;}
                else{drow = qddom.qview.tabmap[this.qview].rows(this.qlist[x]);}

                /* Loop through the
                */
               console.log(drow)
                for(let y=0;y<drow.length;y++){ //loop through object
                    tdat = document.createElement('td');
                    tdat.innerText = (drow[y] == '')?'-': drow[y];
                    trow.appendChild(tdat)
                }
                if(!-1){
                    trow.appendChild(document.createElement('td')).addEventListener('click',qddom.qview.action[this.qview]); //set the action button
                }

                this.qtable.appendChild(trow);
            }
        }
    }

    /* Event placed at end of row ///////////////////////////////////////
        Loads/delets an edit bar from a row
    */
    SetTableRowEditor = (ele)=>{
        let elpar = ele.target; //finds the table row
        while(elpar.tagName!= 'TR'){
            elpar = elpar.parentNode;
        }
        if(elpar.classList.contains(qddom.qview.utils.trowbar.editing)){
            elpar.classList.remove(qddom.qview.utils.trowbar.editing); //remove editing
            elpar.removeChild(elpar.children[elpar.children.length-1]);
        }else{
            elpar.classList.add(qddom.qview.utils.trowbar.editing); //declare editing
            elpar.appendChild(document.createElement('td')).innerHTML = document.getElementById(qddom.qview.roptbar[this.qview]).innerHTML;
            elpar.children[elpar.children.length-1].classList.add(qddom.qview.utils.trowbar.editbar);
            this.SetOptionButtons();
        }
    }

    /* Sets the option bar actions //////////////////////////////////////

    */
    SetOptionButtons = ()=>{
        for(let o in qddom.qview.utils.trowbar.optactions){
            let opt = qddom.qview.utils.trowbar.optactions[o];
            let butts = this.qtable.getElementsByClassName(opt[0]);
            for(let x=0;x<butts.length;x++){
                butts[x].addEventListener('click',(ele)=>{
                    let trow = ele.target.parentNode.parentNode;
                    let ref = this.TRIMsrlist({qid:trow.children[0].innerText})[0];//
                    if(ref || ref !=undefined){
                        opt[1](ref);
                    }else{

                    }
                });
                butts[x].src = opt[2];
            }
        }
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////




/* Switch a View    /////////////////////////////////////////////
    PASS:
        - butt - element selected
        - view = {
            views:{}
            swtchs:{}
        }
*/
var switchview = (views,swtch)=>{
    for(let v in views){
        if(swtch == v){
            $('#'+ views[v]).show();
            document.getElementById(qddom.qview.swtchs[v]).classList.add(qddom.qview.utils.switchselected);
        }else{
            $('#' + views[v]).hide();
            document.getElementById(qddom.qview.swtchs[v]).classList.remove(qddom.qview.utils.switchselected);
        }
    }
}

/*  Setting Table Switches  /////////////////////////////////////
    PASSED:
        - view = {
            swtchs
        }
*/
var setViewSwitches = ({views,swtchs})=>{
    for(let v in views){
        if(swtchs[v]){
            document.getElementById(swtchs[v]).addEventListener('click',(ele)=>{
                switchview(views,v);
            });
        }
    }
}
///////////////////////////////////////////////////////////////////////////
/* QUOTE ACTIONS //////////////////////////////////////////////////////////

    Attaches events to quote actions in the dom.

    Items referred to below need to be created in the dom and declared
    above in qddom before they can be used successfully.
*/
/* Create New Quote
    Begins the "new quote creation process"

    Needs to operate with any quote dash. Way to include specific
    Placed on a specific button to be clicked
*/
var CreateNewQuote = (reqname,setupQuote = ()=>{return winquote()})=>{
    document.getElementById(qddom.nav.buttons.newquote).addEventListener('click',(ele)=>{
        let subnewq = setupQuote();
        if(subnewq){
            ipcRenderer.send(reqname,subnewq);
        };
    });
}
/* Load Last Quote
    Opens a quote page and loads the last loaded quote to it
    If there is not a "last" quote, nothing is loaded
*/
var LoadLastQuote = (reqname,extraWork = ()=>{})=>{
    document.getElementById(qddom.nav.buttons.lastquote).addEventListener('click',(ele)=>{
        let res = extraWork;
        ipcRenderer.send(dashroutes.openquote,'loading last');
    });
}
///////////////////////////////////////////////////////////////////////////


module.exports = {
    qddom,
    Quotes,
    QuoteDisplay,
    setViewSwitches,

    CreateNewQuote,
    LoadLastQuote,
    winquote
}
