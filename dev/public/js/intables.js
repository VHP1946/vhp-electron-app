

var intdom = {
    cont:'intable-cont',
    row:{
        cont:'intable-bottom-add-row',
        todelete:'intable-row-delete',
        actions:{
            delete:'intable-action-delete'
        }
    }
}

class BottomAddTable{
    constructor(tname,trow,delrow = intdom.row.todelete){
        this.tname = tname;
        this.trow = trow;
        this.delrow = delrow,
        this.table = document.getElementById(this.tname) || null;
        this.table.getElementsByClassName(intdom.row.actions.delete)[0].addEventListener('dblclick',(ele)=>{
            this.DELETErows();
        })
    }

    SETtable = (SETtrow = ()=>{})=>{
        this.CLRtable();
        if(this.data.display){
          for(let x=0;x<this.data.display.length;x++){
              SETtrow(this.data.display[x]);
          }
        }

    }

    GETtable = (GETtrow = ()=>{})=>{
        let tdat = [];
        for(let x=1;x<this.table.children.length-1;x++){
            if(!this.table.children[x].classList.contains(intdom.row.todelete)){
                tdat.push(GETtrow(this.table.children[x]));
            }
        }
        return tdat;
    }

    SETdelete = (ele)=>{
        let row = this.FINDrow(ele);
        let down = true
        ele.addEventListener('mouseup',(ele)=>{
            down=false;
        });
        setTimeout(()=>{
            if(down){
                if(row.classList.contains(this.delrow)){
                    row.classList.remove(this.delrow);
                }else{row.classList.add(this.delrow)}
            }else{console.log('was not down')}
        },500);
    }

    FINDrow = (ele)=>{
        if(ele.classList.contains(this.trow)){return ele}
        else{return this.FINDrow(ele.parentNode)}
    }

    DELETErows = ()=>{
        for(let x=0;x<this.table.children.length;x++){
            if(this.table.children[x].classList.contains(this.delrow)){
                this.table.removeChild(this.table.children[x]);
                x--;
            }
        }
    }

    CLRdelete = ()=>{
        for(let x=0;x<this.table.children.length;x++){
            this.table.children[x].classList.remove(this.delrow);
        }
    }

    CLRtable = ()=>{
      let rows = this.table.children.length - 2;
      while(rows>0){
        this.table.removeChild(this.table.children[rows]);
        --rows;
      }
    }
}



module.exports = {
    BottomAddTable
}
