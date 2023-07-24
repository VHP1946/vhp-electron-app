/*

*/

var $ =require('jquery');

var {BottomAddTable} = require('./intables.js');

var {WindowKey} = require('../js/keymaker.js');

var cuin = (h,w)=>{return Number(h)+Number(w);}


class WinBuild extends BottomAddTable{
    constructor(key = null,data=null){
        let wtdom = {
            cont:'winbuild-table',
            row:{
                cont:'winbuild-table-row',
                todelete:'winbuild-table-todelete',
                win:{
                    style:'winbuild-win-type',
                    story:'winbuild-win-story',
                    room:'winbuild-win-room',
                    location:'winbuild-win-location',
                    height:'winbuild-win-height',
                    width:'winbuild-win-width',
                    options:'winbuild-win-options',
                    option:{
                        cont:'winbuild-win-option',
                        name:'winbuild-win-option-name',
                        selected:'winbuild-win-option-select'
                    }
                }
            },
            lists:{
                styles:'win-type-list'
            }
        }
        super(wtdom.cont,wtdom.row.cont);

        this.wtdom = wtdom;
        this.key = new WindowKey(); //window key
        this.key.SETkey(key);
        this.data = data && data != undefined ? data :{
            build:[],
            display:[]
         };

        this.table.addEventListener('change',(ele)=>{ //Refresher
            this.REFRESHbuild();
            //update necessary display
        });

        //Event listener to refresh on delete
        this.table.getElementsByClassName('intable-action-delete')[0].addEventListener('dblclick',(ele)=>{
            this.data.display = this.GETtable(this.GETtablerow);
            this.data.build = this.RUNtable();
        })

        //watch last row for any adds to table
        this.table.children[this.table.children.length-1].children[0].addEventListener('change',(ele)=>{
            this.SETtablerow({style:ele.target.value,story:1});
            ele.target.value = '';
        });
        if(key !=null){this.SETstylelist();}
    }

    SETwinbuild = (key,data)=>{
      this.key.SETkey(key);
      this.data = data !=null  || data != undefined? data:{
        build:[],
        display:[]
      };
      if(key!=null){this.SETstylelist();}

      this.SETtable(this.SETtablerow);
    }
    /*  Create a window row, and add to table

        - Clones a hidden template row
        - Fills the template with values
        - Adds the cloned template to the bottom of table
    */
    SETtablerow = (wob = {})=>{

        let trow = document.getElementById(this.wtdom.row.cont).cloneNode(true);
        trow.classList.add(this.wtdom.row.cont);
        trow.getElementsByClassName(this.wtdom.row.win.style)[0].value = wob.style || '';
        trow.getElementsByClassName(this.wtdom.row.win.story)[0].value = wob.story || '';
        trow.getElementsByClassName(this.wtdom.row.win.room)[0].value = wob.room || '';
        trow.getElementsByClassName(this.wtdom.row.win.location)[0].value = wob.location || '';
        trow.getElementsByClassName(this.wtdom.row.win.width)[0].value = wob.width || '';
        trow.getElementsByClassName(this.wtdom.row.win.height)[0].value = wob.height || '';

        //validate input
        this.SETglassoptions(trow.children[0].value,trow.getElementsByClassName(this.wtdom.row.win.options)[0],wob.options);

        trow.addEventListener('mousedown',(ele)=>{
            this.SETdelete(ele.target);
        });
        this.table.insertBefore(trow,this.table.children[this.table.children.length-1]);
        //set the options for the newly created type
        trow.id='';
        $(trow).show();

    }

    /*  Retrieves data from a table row, and retruns as object

        - Passed a row from table
        - Create object from row
        - return object
    */
    GETtablerow = (tr)=>{
        let win = {};
        win.style = tr.children[0].getElementsByClassName(this.wtdom.row.win.style)[0].value;
        win.story = tr.children[0].getElementsByClassName(this.wtdom.row.win.story)[0].value;
        win.room = tr.children[0].getElementsByClassName(this.wtdom.row.win.room)[0].value;
        win.location = tr.children[0].getElementsByClassName(this.wtdom.row.win.location)[0].value;
        win.width = tr.children[0].getElementsByClassName(this.wtdom.row.win.width)[0].value;
        win.height = tr.children[0].getElementsByClassName(this.wtdom.row.win.height)[0].value;

        win.options = [];
        let opts = tr.getElementsByClassName(this.wtdom.row.win.option.cont); //get all the options
        for(let x=0;x<opts.length;x++){ //get all the checked options
            if(opts[x].firstChild.checked){win.options.push(opts[x].lastChild.innerText);}
        }
        return win;
    }

    //Double Click to initiate
    //DELETEtable = (ele)=>{}

    ////////////////////////////////////////////////////////////////

    //  OPTIONS  ///////////////////////////////////////////////////

    SETglassoptions = (sty,ele,list=[])=>{
        ele.innerHTML = '';
        let nopt;
        for(let s in this.key.key.info.options){
            nopt = ele.appendChild(document.createElement('div'));

            nopt.appendChild(document.createElement('input')).classList.add(this.wtdom.row.win.option.selected);

            nopt.classList.add(this.wtdom.row.win.option.cont);
            nopt.appendChild(document.createElement('div')).classList.add(this.wtdom.row.win.option.name);


            nopt.lastChild.innerText = s;
            nopt.firstChild.type = 'checkbox';
            for(let y=0;y<list.length;y++){
                if(nopt.lastChild.innerText == list[y]){
                    nopt.firstChild.checked = true;
                    break;
                }
            }
        }
    }
    ////////////////////////////////////////////////////////////////

    //  LISTS  ////////////////////////////////////////////////////
    SETstylelist = ()=>{
        let awin = this.key.key.windows[0].styles;
        let stylelist = document.getElementById(this.wtdom.lists.styles);
        let opt;
        stylelist.innerHTML='';
        for(let x=0;x<awin.length;x++){
            opt = document.createElement('option');
            opt.innerText = awin[x].info.style || 'NA';
            stylelist.appendChild(opt);
        }
    }
    ////////////////////////////////////////////////////////////////

    ValidateRow = (row,style)=>{
      return (cuin(row.height,row.width) < Number(style.info.maxuinch) && cuin(row.height,row.width) != 0) ? true:false;
    }

    RUNtable = ()=>{

        let wbuild = {
            info:{
                labor: this.GETbuildhours(this.GETtable(this.GETtablerow))
            },
            tiers:[]
        };

        for(let x=0;x<this.key.key.windows.length;x++){
            wbuild.tiers.push({
                tier:this.key.key.windows[x].info.tier,
                model:this.key.key.windows[x].info.model,
                windows:[],//list of windows and their options
                cost:0, //cost of windows and their options
                price:0 //cost * margin
            });
            let wtab=this.GETtable(this.GETtablerow); //get fresh table
            for(let y=0;y<wtab.length;y++){
                let win = this.key.GETstyle(this.key.GETtier(wbuild.tiers[x].tier),wtab[y].style); //gets the first available style

                //validate size (only united inch)
                //mark window
                wtab[y].maxuinch = this.ValidateRow(wtab[y],win.style); //true || false

                wtab[y].model = win.tier.info.model; //label the window model being used
                for(let z=0;z<wtab[y].options.length;z++){ //replace the option name with an option object
                    /*  Find available options
                        Start at the most recent model / tier
                        Will tag if model / tier was upgraded
                    */
                    wtab[y].options.push(
                        this.key.GEToption(
                            win.tier.info.tier,
                            win.style,
                            wtab[y].options.shift(),
                            cuin(wtab[y].height, wtab[y].width)
                        )
                    );
                    win.tier = this.key.GETmodel(wtab[y].options[wtab[y].options.length-1].model); //set to last available tier for this window
                    //if the
                    wtab[y].model = win.tier.info.model; //label the window model being used

                    //need to adjust if model was updated in middle of for loop
                    if(wtab[y].maxuinch){ //do not include if bad size
                      wbuild.tiers[x].cost += this.GEToptioncost(wtab[y].options[wtab[y].options.length-1],wtab[y].width,wtab[y].height); //add option cost
                    }
                }
                win = this.key.GETstyle(win.tier,wtab[y].style);
                if(wtab[y].maxuinch){
                  wbuild.tiers[x].cost += win.style.info.uinch * cuin(wtab[y].height,wtab[y].width);
                }
                wbuild.tiers[x].windows.push(wtab[y]);
                //console.log(wtab[y]);
            }
          wbuild.tiers[x].cost += wbuild.info.labor.hours * this.key.key.info.labtab.rate; //add the labor to cost
          wbuild.tiers[x].price = wbuild.tiers[x].cost /(1-this.key.key.info.margin);
        }
        return wbuild;
    }


    REFRESHbuild=()=>{
        console.log("About to refresh window build:", this.data, this.key)
        this.SETstylelist(); //Refresh droplist to reflect changes to styles
        this.data.display = this.GETtable(this.GETtablerow);
        this.data.build = this.RUNtable();
        console.log("Refreshed window build", this.data)
        return true
    }

    GEToptioncost = (opt,w=0,h=0)=>{
        let size = 0;
        if(opt.rate!=0){
            switch(opt.unit.toUpperCase()){
                case 'SQ':{
                    size = Number(w)*Number(h);
                    break;
                }
                case 'UI':{
                    size = cuin(h,w);
                }
            }
        }
        return Number(opt.rate) * size;
    }

    GETbuildhours = (wins = [])=>{
        let hours = 0;
        let cost = 0;

        for(let x=0;x<wins.length;x++){
            hours+=this.key.GETwinhours(wins[x].width,wins[x].height,wins[x].story);
        }

        return {
            hours:hours,
            cost:hours * this.key.key.info.labtab.rate
        }
    }
}


module.exports={
    WinBuild
}
