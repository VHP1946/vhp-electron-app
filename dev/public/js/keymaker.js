/* Creates a key for Building Envelope Window Quoter

    Takes the window pricing tool and reads from the key
     sheets.
*/

const reader = require('xlsx');

/*  Filter Price Book

    Used to seperate the needed
    parts from the BEE price book

    Passed:
        - prod = the type of product
            + 'windows'
            + 'insulation'
            + 'doors'
    Returns:
        - the product code to match
          the code in the book sheets
*/
var getProductCode =(prod = '')=>{
    switch(prod.toUpperCase()){
        case 'WINDOWS': return 'win'; //window code
        case 'DOORS': return 'door'; //door code
        case 'INSULATION':return 'insu'; //insulation code
        case '':return 'win,door,insu'; //returns all product codes
    }
}
/*  Get Product Sheets
    With a product code AND the book
    it builds an array of only related
    product sheets.
*/
var getProductSheets = (pcode,book)=>{
    if(book){
        let prodsheets = [];
        for(let sh in book.Sheets){
            let jsh  = reader.utils.sheet_to_json(book.Sheets[sh]);
            if(jsh[0][pcode + 'info']|| jsh[0][pcode + 'tier']){
                prodsheets.push(jsh);
            }
            if(jsh[0]['beefin']){
              prodsheets.push(jsh);
            }
            if(jsh[0]['beeinsul']){
              prodsheets.push(jsh);
            }
        }
        return prodsheets;
    }else{return [];}
}



/* Window Key
    holds the pricing key for a tier of windows

    FORMAT:
        info:
         - Date
         - margin
         - labtab
         - trimtab
        tier:[] //array reflecting the declared number of tiers on the key (=number of sheets)
            -info:
                > tier
                > brand
                > model

            -styles:[] //array holding all of the styles in a given tier
                -info:  *will be rely on to ave
                    > style
                    > minw
                    > maxw
                    > minh
                    > maxh
                    > uinch

                    > TEMPERED GLASS
                    > OBSCURE GLASS
                    > INTERNAL GRIDS
                    > SIMULATED DIVIDED LIGHT

                -sizes:[] //array holding all of the sizes available in each style
                    > width
                    > height
                    > uinch
                    > lab1
                    > lab2

                    > TEMPERED GLASS
                    > OBSCURE GLASS
                    > INTERNAL GRIDS
                    > SIMULATED DIVIDED LIGHT
                    > MULLION
*/
class WindowKey{
    /*  Constructor
        takes in an array of ordered info
        shs[0] = overall key info
        shs[1,2,3..] = tiers to price
        takes in an excel sheet as a json object
    */
    constructor(winarr){
        console.log(nkey);
        this.key = abeeqkey(nkey);
        /*{
            info:{
                finance:[],
                date:'',
                margin: 0,
                labtab:{
                    rate:0,
                    base:0,

                    sizes:[],

                    elevated:0,
                    trim:0
                },
                trimtab:{
                    heads:[],
                    vals:[]
                },
                options:{}
            },
            windows:[],
            glassblock:{
                margin:0,
                maxuinch:0,
                base:0,
                sizes:[],
                options:{
                    heads:[],
                    vals:[]
                }
            },
            insulation:{
              margin:0,
              packages:[],
              options:[]
            }
        }*/
        if(winarr){

            for(let x=0;x<winarr.length;x++){ //loop through winarr (array of sheets_to_json)
                if(winarr[x][0].wininfo){ //is the info sheet
                    this.READinfosh(winarr[x]);
                }else if(winarr[x][0].beefin){ //is a window sheet
                    this.READfinance(winarr[x]);
                }else if(winarr[x][0].beeinsul){
                    this.READinsulation(winarr[x]);
                }else{this.key.windows.push(this.READwinsh(winarr[x]));}
            }
        }
    }

    /*  Insulation  ///////////////////////////////////////////////////////

    */
    READinsulation = (sh)=>{
      let skpto; //utility counter
      for(let x=0;x<sh.length;x++){
        switch(sh[x]['beeinsul']){
          case 'margin':{
            this.key.insulation.margin = sh[x].val|| 0;
          }
          case 'opttab':{
            skpto = 1;
            var optarr = [];
            for(let ot in sh[x]){ //form the base option array
              if(skpto>=3){
                optarr.push({
                  name:sh[x][ot],
                  price:sh[x+1][ot],
                  rate:sh[x+2][ot],
                  rule:sh[x+3][ot],
                  note:sh[x+4][ot]
                });
              }
              skpto++;
            }
            this.key.insulation.options=optarr;
            break;
          }
          case 'pactab':{
            skpto = 1;
            let pacobj={};
            for(let pt in sh[x]){
              if(skpto==2){
                pacobj={
                  name:sh[x][pt],
                  price:sh[x+1][pt],
                  rate:sh[x+2][pt],
                  opts:[],
                }
              }else if(skpto>=3){
                //try{
                  pacobj.opts.push({
                    name:(sh[x][pt]!=undefined)?sh[x][pt]:'',
                    price:(sh[x+1][pt]!=undefined)?sh[x+1][pt]:0,
                    rate:(sh[x+2][pt]!=undefined)?sh[x+2][pt]:0,
                    limit:(sh[x+3][pt]!=undefined)?sh[x+3][pt]:0,
                    optref:(sh[x+4][pt]!=undefined)?sh[x+4][pt]:''
                  });
                //}catch{}
              }
              skpto++;
            }
            this.key.insulation.packages.push(pacobj);
          }
        }
      }
      console.log(this.key.insulation.packages[1])
    }

    ///////////////////////////////////////////////////////////////////////

    READfinance = (sh)=>{
      let fintab = [];
      for(let x=1;x<sh.length;x++){
        fintab.push(sh[x]);
      }
      this.key.finance = fintab;
    }
    // Window Consturctor functions ///////////////////////////////////////
    /* Read Info Sheet
        run during constructor
        Process the 'info' sheet for windows
    */
    READinfosh = (sh)=>{
        let skpto; //utility counter
        for(let x=0;x<sh.length;x++){
            switch(sh[x]['wininfo']){
                case 'date': { //get the date
                    this.key.info.date = sh[x].val || new Date();
                    break;
                }
                case 'margin':{ //get the margin
                    this.key.info.margin = sh[x].val || .5;
                    break;
                }
                case 'labtab':{ //get the labor table
                    skpto = 1;
                    for(let lt in sh[x]){
                        if(skpto>=3){
                            if(!isNaN(sh[x][lt])){ //add a size adjustment to the labor table
                                this.key.info.labtab.sizes.push({
                                    level:sh[x][lt] || 'NA',
                                    hours:sh[x+1][lt] || 0 //down 1 row to value
                                });
                            }
                            else{
                                this.key.info.labtab[sh[x][lt].toLowerCase()] = sh[x+1][lt] || 0;
                            }
                        }
                        skpto++;
                    }
                    x++; // to skip the values row of the labtab
                    break;
                }
                case 'trimtab':{ //get the trim table
                    skpto = 1;
                    for(let tt in sh[x]){
                        if(skpto==3){
                            this.key.info.trimtab.heads.push(sh[x][tt]);
                            this.key.info.trimtab.vals.push(sh[x+1][tt]); //down 1 row to value
                        }else{skpto++;}
                    }
                    x++; // to skip the values row of the trimtab
                    break;
                }
                case 'opttab':{ //get the option table
                    /* OPTTAB
                        A new approach as well as new information
                        has been added.

                        New Option table (array of arrays):
                            [0] = name
                            [1] = measurement type
                            [2] = option type
                    */
                    skpto = 1;
                    for(let s in sh[x]){
                        if(skpto==3){
                            this.key.info.options[sh[x][s]] = sh[x][s]; //name of option
                            this.key.info.options[sh[x][s]] = [];
                            this.key.info.options[sh[x][s]].push(sh[x+1][s]); //measurement type
                            this.key.info.options[sh[x][s]].push(sh[x+2][s]); //option type
                        }else{skpto++}
                    }
                    x=x+1;
                    break;
                }
                case 'glassblocktab':{ //get the glass block table
                    skpto = 1;
                    for(let gt in sh[x]){
                        if(skpto==3){
                            if(!isNaN(sh[x][gt])){
                                this.key.glassblock.sizes.push({
                                    size: sh[x][gt] || 'NA',
                                    uinch: sh[x+1][gt] || 'NA'
                                });
                            }else{
                                this.key.glassblock[sh[x][gt].toLowerCase()] = sh[x+1][gt];
                            }
                        }else{skpto++;}
                    }

                    x++; // to skip the values row of the glassblock table
                    break;
                }
                case 'glassblockopts':{
                    skpto = 1;
                    for(let go in sh[x]){
                        if(skpto==3){
                            this.key.glassblock.options.heads.push(sh[x][go]);
                            this.key.glassblock.options.vals.push(sh[x+1][go]);
                        }else{skpto++;}
                    }
                }
            }
        }
    }

    /*  Read Window Sheet
        Function runs in constructor.

        Takes a window tier sheet as
        array of json objects to be
        gone through and trimmed.
    */
    READwinsh = (sh)=>{
        let winob={
            info:{},
            styles:[]
        };
        let y;

        for(let x=0;x<sh.length;x++){
            if(x==0){
                if(sh[x].wintier == undefined){return null}
                winob.info.tier = sh[x].wintier;
                winob.info.brand = sh[x].brand;
                winob.info.model = sh[x].model;
            }else{
                if(sh[x].style){ //grabs only the different style info
                    let style = {
                        info:sh[x],
                        sizes:[]
                    };
                    y = x+4;
                    try{ //to catch the EOF
                        while(!sh[y].style || sh[y].style == undefined){
                            style.sizes.push(this.READstysize(sh[y]));
                            y++;
                        }
                    }catch{console.log('EOF')}
                    winob.styles.push(style)
                    x = y-1
                }
            }
        }
        return winob;
    }

    /*  Read Window Size
    */
    READstysize = (size)=>{
        let siz = {
            uinch: Number(size.width) + Number(size.height)
        };
        for(let s in size){
            if(s != 'width' && s != 'height' && s != 'uinch' && !s.includes('__')){
                siz[s] =  Number(size[s]);
            }
        }
        return siz;
    }
    ///////////////////////////////////////////////////////////////////////

    /*  Set a key
        takes in a key object to set this.key to that object
        Some care needs to be taken when doing this depending
         on the object passed.
    */
    SETkey = (nkey)=>{
        this.key = nkey;
    }

    /*  Get a desired tier object number
        Returns the array location of a tier by its passed name
    */
    GETtier = (tname)=>{
        let atier = null;
        for(let x=0;x<this.key.windows.length;x++){
            if(this.key.windows[x].info.tier == tname){
                atier = this.key.windows[x];
                break;
            }
        }
        return atier;
    }

    /*  Get a desired tier object my the model
    */
    GETmodel = (mname)=>{
        let amodel = null;
        for(let x=0;x<this.key.windows.length;x++){
            if(this.key.windows[x].info.model == mname){
                amodel = this.key.windows[x];
                break;
            }
        }
        return amodel;
    }

    GETuptier = (tname)=>{
        for(let x=0;x<this.key.windows.length;x++){
            //console.log("418:::::::::::", this.key.windows[x].info.tier, tname)
            //console.log("NEXT::::::::::::", this.key.windows[x+1])
            if(tname == this.key.windows[x].info.tier){
                return (x+1 < this.key.windows.length) ? this.key.windows[x+1] : null;
            }
        }
    }

    /*  Get a desired style object
        Pass:
            -tname = tier name
            -styname = style name
    */
    GETstyle = (atier,styname)=>{
        let ntier = this.GETuptier(atier.info.tier);
        for(let x = 0;x<atier.styles.length;x++){
            if(atier.styles[x].info.style == styname){
                //found style in tier
                if(atier.styles[x].info.uinch != 0 || atier.styles[x].info.uinch != '' || !ntier){//is available || is the last tier avaliable
                    return {
                        tier:atier,
                        style:atier.styles[x]
                    }
                }
            }
        }
        return this.GETstyle(ntier,styname);//check the next available option
    }

    CHECKsize = ()=>{

    }

    /*  Get an option

        PASS:
            - tname = tier name
            - style = style as object
            - optname = option name
            - wuinch = windows united inch
    */
    GEToption = (tname,style,optname,wuinch)=>{
        let opt = {
            name: optname,
            rate: 0,
            unit: '',
            model: this.GETtier(tname).info.model
        }

        let canup = (this.key.info.options[optname][1].toUpperCase() == 'Y' ? true : false); //can the option be upgraded if it is not available
        let up = false;
        let uptier = this.GETuptier(tname);


        let setup = ()=>{up=true;return true}

        if(style.info[optname] != 0 || (canup ? setup():false)){
            let avail = true;
            if(!up){
                for(let x=0;x<style.sizes.length;x++){
                    if(style.sizes[x].uinch<wuinch && style.sizes[x][optname]==0){
                        console.log('Not Available')
                        avail = false;
                        break;
                    }
                }
                if(avail){ //found and set
                    opt.rate = style.info[optname];
                    opt.unit = this.key.info.options[optname][0]; //get the unit used
                }else{ //upgrade
                    //console.log('--',uptier);
                    if(!uptier){return opt}
                    return this.GEToption(
                        uptier.info.tier,
                        this.GETstyle(uptier,style.info.style).style,
                        optname,
                        wuinch
                        )
                }
            }else{ //upgrade
                //console.log('++',uptier);
                if(!uptier){return opt}
                return this.GEToption(
                    uptier.info.tier,
                    this.GETstyle(uptier,style.info.style).style,
                    optname,
                    wuinch
                    )
            }
        }
        return opt;
    }

    GETwinhours = (w=0,h=0,elev=0)=>{
          let hours = this.key.info.labtab.base; //starting hours
          let uin = Number(w) + Number(h);
          for(let y=0;y<this.key.info.labtab.sizes.length;y++){ //add hours for size
              if(uin < this.key.info.labtab.sizes[y].level){break;}
              hours += this.key.info.labtab.sizes[y].hours;
          }
          return hours+=this.key.info.labtab.elevated * (elev != '' && elev>0 ? Number(elev)-1 : 0);
    }


    /*  GLASSBLOCK  //////////////////////////////////////////////////////////
    */
    GETgbrate = (uin=0)=>{
        let rate = this.key.glassblock.base; //starting hours
        for(let y=0;y<this.key.glassblock.sizes.length;y++){
            if(uin<this.key.glassblock.sizes[y].size){break;}
            rate = this.key.glassblock.sizes[y].uinch;
        }
        return rate * uin;
    }

    GETgboption = (optname)=>{
        for(let x=0;x<this.key.glassblock.options.heads.length;x++){
            if(this.key.glassblock.options.heads[x] == optname){
                return this.key.glassblock.options.vals[x];
            }
        }
        return 0;

    }
    /////////////////////////////////////////////////////////////////////////

    /*  FINACING  ///////////////////////////////////////////////////////////
    */
    GETfinprice = (price,plan)=>{
      let finplan = this.GETfinplan(plan);
      if(finplan){
        let nprice = Number(finplan.drate*price + price).toFixed(2);
        return {
          title:finplan.title,
          price:nprice,
          monthly:Number((finplan.inrate == 0)? nprice/finplan.term : nprice * finplan.inrate).toFixed(2),
          term:finplan.term
        }
      }
      return{
        title:'',
        price:price,
        monthly:0,
        term:0
      }
    }
    GETfinplan = (plan)=>{
      for(let x=0;x<this.key.finance.length;x++){
        if(plan == this.key.finance[x].plan){
          return this.key.finance[x];
        }
      }
      return null
    }
}

module.exports = {
    getProductCode,
    getProductSheets,
    WindowKey
}
