var {BottomAddTable} = require('./intables.js');
const { WindowKey } = require("./keymaker.js")


class GBlockBuild extends BottomAddTable{
    constructor(key=null,data=null){
         let gbtdom = {
            cont:'gbbuild-table',
            row:{
                cont:'gbbuild-table-row',
                win:{
                    area:'gbbuild-gb-area',
                    width:'gbbuild-gb-width',
                    height:'gbbuild-gb-height',
                    options:'gbbuild-gb-options',
                    option:{
                        cont:'gbbuild-gb-option',
                        name:'gbbuild-gb-option-name',
                        selected:'gbbuild-gb-option-selected'
                    }
                }
            }
         }
        super(gbtdom.cont,gbtdom.row.cont);

         this.gbtdom = gbtdom;

         this.key = new WindowKey();
         this.key.SETkey(key);
         this.data = data !=null || data !=undefined? data :{
            build:[],
            display:[]
         };

        this.table.addEventListener('change',(ele)=>{ //gather table changes
            this.data.display = this.GETtable(this.GETtablerow);
            this.data.build = this.RUNtable();
         });

        //Event listener to refresh on delete
        this.table.getElementsByClassName('intable-action-delete')[0].addEventListener('dblclick',(ele)=>{
            this.data.display = this.GETtable(this.GETtablerow);
            this.data.build = this.RUNtable();
        })

         this.table.children[this.table.children.length-1].children[0].addEventListener('change',(ele)=>{
            console.log("Table Child Event Listener")
            this.SETtablerow({area:ele.target.value});
            ele.target.value = '';
         });
    }

    SETgbbuild = (key,data)=>{
        this.key.SETkey(key);

        this.data = data !=null || data != undefined?data:{
            build:[],
            display:[]
        };
        this.SETtable(this.SETtablerow);
    }

    /*  Create a window row, and add to table

        - Clones a hidden template row
        - Fills the template with values
        - Adds the cloned template to the bottom of table
    */
    SETtablerow = (gbob = {})=>{
        let trow = document.getElementById(this.gbtdom.row.cont).cloneNode(true);
        trow.classList.add(this.gbtdom.row.cont);

        trow.getElementsByClassName(this.gbtdom.row.win.area)[0].value = gbob.area || '';
        trow.getElementsByClassName(this.gbtdom.row.win.height)[0].value = gbob.height || '';
        trow.getElementsByClassName(this.gbtdom.row.win.width)[0].value = gbob.width || '';


        this.SETglassoptions(trow,gbob.options);

        trow.addEventListener('mousedown',(ele)=>{
            this.SETdelete(ele.target);
        });

        this.table.insertBefore(trow,this.table.children[this.table.children.length-1]);
        //set the options for the newly created type
        trow.id='';
        $(trow).show();

    }

    GETtablerow = (tr)=>{
        let gbrow = {};
        gbrow.area = tr.children[0].getElementsByClassName(this.gbtdom.row.win.area)[0].value;
        gbrow.width = tr.children[0].getElementsByClassName(this.gbtdom.row.win.width)[0].value;
        gbrow.height = tr.children[0].getElementsByClassName(this.gbtdom.row.win.height)[0].value;

        gbrow.options = [];
        let opts = tr.getElementsByClassName(this.gbtdom.row.win.option.cont); //get all options from row
        for(let x=0;x<opts.length;x++){ //get all the checked options
            if(opts[x].firstChild.checked){gbrow.options.push(opts[x].lastChild.innerText);}
        }
        return gbrow;
    }

    SETglassoptions = (trow,list = [])=>{
        var ele = trow.getElementsByClassName(this.gbtdom.row.win.options)[0];
        ele.innerHTML = '';
        let nopt;
        for(let x=0;x<this.key.key.glassblock.options.heads.length;x++){
            nopt = ele.appendChild(document.createElement('div'));
            nopt.classList.add(this.gbtdom.row.win.option.cont);

            nopt.appendChild(document.createElement('input')).classList.add(this.gbtdom.row.win.option.selected);
            nopt.appendChild(document.createElement('div')).classList.add(this.gbtdom.row.win.option.name);

            nopt.lastChild.innerText = this.key.key.glassblock.options.heads[x];
            nopt.firstChild.type = 'checkbox';
            for(let y=0;y<list.length;y++){
                if(nopt.lastChild.innerText == list[y]){
                    nopt.firstChild.checked = true;
                    break;
                }
            }
        }
    }

    SETkey =(key)=>{
        this.key = key;
    }

    RUNtable = ()=>{
        let gbuild = {
            info:{
                cost:0,
                price:0
            },
            glassblocks:[]
        };

        for(let x=0;x<this.data.display.length;x++){
            let gblock = {
                area: this.data.display[x].area,
                width:Number(this.data.display[x].width),
                height:Number(this.data.display[x].height),
                uinch: Number(this.data.display[x].width) + Number(this.data.display[x].height),
                options:this.data.display[x].options
            }
            gbuild.info.cost += this.key.GETgbrate(gblock.uinch); //get the base rate
            for(let y=0;y<gblock.options.length;y++){
                gbuild.info.cost += this.key.GETgboption(gblock.options[y]);
            }
            gbuild.glassblocks.push(gblock);
        }
        gbuild.info.price =  gbuild.info.cost /(1-this.key.key.glassblock.margin);
        console.log("GBBUILD FROM GBQUOTE", gbuild)
        return gbuild;
    }

    REFRESHbuild = ()=>{
        this.data.display = this.GETtable(this.GETtablerow);
        this.data.build = this.RUNtable();
        console.log("Refreshed gb build", this.data)
        return true
    }
    GETbuildhours = (gblocks = [])=>{
        let hours = 0;
        let cost = 0;

        for(let x=0;x<gblocks.length;x++){
            hours+=this.key.GETgbhours(gblocks[x].width,gblocks[x].height);
        }

        return {
            hours:hours,
            cost:cost
        }
    }
}

module.exports = {
    GBlockBuild
}
