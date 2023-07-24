var {BottomAddTable} = require('./intables.js');


class AddBuild extends BottomAddTable{
    constructor(data){
        var atdom = {
            cont:'additions-table',
            row:{
                cont:'additions-table-row',
                addition:{
                    desc:'addition-row-description',
                    amount:'addition-row-amount'
                }
            }
        }
        super(atdom.cont,atdom.row.cont);
        this.atdom = atdom;
        this.data = data ? data :{
           build:[],
           display:[]
        };
        this.table.addEventListener('change',(ele)=>{ //gather table changes
          this.REFRESHbuild();
        });
        this.table.children[this.table.children.length-1].children[0].addEventListener('change',(ele)=>{
            this.SETtablerow({desc:ele.target.value});
            ele.target.value = '';
        });

    }

    SETaddbuild = (data=null)=>{
      this.data = data ? data :{
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
    SETtablerow = (aob = {})=>{
        let trow = document.getElementById(this.atdom.row.cont).cloneNode(true);
        trow.classList.add(this.atdom.row.cont);

        trow.getElementsByClassName(this.atdom.row.addition.desc)[0].value = aob.desc || '';
        trow.getElementsByClassName(this.atdom.row.addition.amount)[0].value = aob.amount || '';

        trow.addEventListener('mousedown',(ele)=>{
            this.SETdelete(ele.target);
        })
        this.table.insertBefore(trow,this.table.children[this.table.children.length-1]);

        //set the options for the newly created type
        trow.id='';
        $(trow).show();
    }

    GETtablerow = (tr)=>{
        let gbrow = {};
        gbrow.desc = tr.getElementsByClassName(this.atdom.row.addition.desc)[0].value;
        gbrow.amount = tr.getElementsByClassName(this.atdom.row.addition.amount)[0].value;
        return gbrow;
    }

    REFRESHbuild = ()=>{
        this.data.display = this.GETtable(this.GETtablerow);
        this.data.build = this.GETtable(this.GETtablerow);
        return true
    }
}

module.exports = {
    AddBuild
}
