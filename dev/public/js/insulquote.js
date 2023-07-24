


class InsulBuild{
  constructor(key=null,data=null){

    this.insdom = {
      cont:'insul-build-cont',
      actions:{
        calc:'insul-build-button-calc'
      },
      totals:{
        price:'insul-build-pricing-total'
      },
      inputs:{
        sq:'insul-calc-sq',
        indepth:'insul-calc-indepth'
      },
      options:{
        list:'insul-build-options',
        option:{
          name:'insul-option-name',
          quant:'insul-option-quant',
          select:'insul-checkbox'
        }

      },
      packages:{
        list:'insul-build-packages',
        package:{
          cont:'insul-package-cont',
          name:'insul-package-name'
        },
        select:'insul-package-selected'
      }
    }

    this.key = key;

    this.data = (data&&data!=undefined)?data:{
      build:{
        info:{
          price:0,
          sq:0,
          indepth:0
        },
        options:[],
        package:{}
      },
      display:[]
    };

    //console.log(this.key);

    this.SEToptions();
    this.SETpackages();

    document.getElementById(this.insdom.actions.calc).addEventListener('click',(ele)=>{
      this.GETinsbuild();
    });
  }


  SETinsbuild=(key,data)=>{
    this.key=(key!=undefined)?key:null;
    this.data=(data!=undefined)?data:{
      build:{},
      display:[]
    };
    //set display
  }

  GETinsbuild=()=>{
    this.data.build.info.sq = document.getElementById(this.insdom.inputs.sq).value!=''?document.getElementById(this.insdom.inputs.sq).value:0;
    this.data.build.info.indepth = document.getElementById(this.insdom.inputs.indepth).value!=''?document.getElementById(this.insdom.inputs.indepth).value:0;
    this.data.build.price = 0;
    this.GEToptions();
    this.GETpackages();
    //console.log(this.data.build);

    this.data.build.info.price = this.data.build.package?Number(this.data.build.options.price)+Number(this.data.build.package.cost):Number(this.data.build.options.price);

    if(this.data.build.package){
      //may want to adjust on limits where necessary
    }

    document.getElementById(this.insdom.totals.price).innerText = this.data.build.info.price;//set the final price
  }
  //Displays the insulation options in build
  SEToptions=()=>{
    var olist = document.getElementById(this.insdom.options.list);
    olist.innerHTML = ''
    for(let x=0;x<this.key.options.length;x++){
      let opt = document.createElement('div');//option CONTAINER


      //option name
      opt.appendChild(document.createElement('div'));
      opt.lastChild.innerText = this.key.options[x].name;
      opt.lastChild.classList.add(this.insdom.options.option.name);
      opt.lastChild.classList.add(this.insdom.options.option.select);
      opt.lastChild.addEventListener('click',(ele)=>{
      if(ele.target.classList.contains('insul-checkbox-checked')){
        ele.target.classList.remove('insul-checkbox-checked');
        }else{ele.target.classList.add('insul-checkbox-checked');}
      });

      if(this.key.options[x].rate=='per'){ //if the option requires input
        opt.appendChild(document.createElement('input'))
        opt.lastChild.classList.add(this.insdom.options.option.quant);
      }

      //checkbox
      //opt.appendChild(document.createElement('div'));
      //opt.lastChild.classList.add(this.insdom.options.option.select);
      //opt.lastChild.addEventListener('click',(ele)=>{
      //  if(ele.target.classList.contains('vg-checkbox-checked')){
      //    ele.target.classList.remove('vg-checkbox-checked');
      //  }else{ele.target.classList.add('vg-checkbox-checked');}
      //});

      olist.appendChild(opt);
    }
  }
  //need to have a have package data first
  GEToptions=()=>{
    //get options from form
    var olist = document.getElementById(this.insdom.options.list);
    var odata = {
      price:0,
      select:[]
    };

    for(let x=0;x<olist.children.length;x++){ //get selected options
      let opt;
      if(olist.children[x].getElementsByClassName(this.insdom.options.option.select)[0].classList.contains('insul-checkbox-checked')){
        //console.log(olist.children[x].getElementsByClassName(this.insdom.options.option.name)[0].innerText);

        opt = this.FINDoption(olist.children[x].getElementsByClassName(this.insdom.options.option.name)[0].innerText);
        opt.quant=(opt.rate=='per')?olist.children[x].getElementsByClassName(this.insdom.options.option.quant)[0].value:1; //add quantity
        odata.select.push(opt);
        switch(opt.rate){
          case 'per':{ //rely on quantity
            odata.price += Number(opt.price)*Number(opt.quant);
            break;
          }
          case 'sq':{ //refer to space square foot
            odata.price +=Number(opt.price)*Number(this.data.build.info.sq);
          }
        }
      }
    }
    this.data.build.options = odata;
  }


  SETpackages=()=>{
    var plist = document.getElementById(this.insdom.packages.list);
    plist.innerHTML='';
    for(let x=0;x<this.key.packages.length;x++){
      let pele = document.createElement('div');
      pele.classList.add(this.insdom.packages.package.cont);
      pele.addEventListener('click',(ele)=>{
        let pl = document.getElementById(this.insdom.packages.list);
        for(let x=0;x<pl.children.length;x++){
          pl.children[x].classList.remove(this.insdom.packages.select);
        }
        pele.classList.add(this.insdom.packages.select);
      });
      pele.appendChild(document.createElement('div'));
      pele.lastChild.innerText = this.key.packages[x].name; //package name value
      pele.lastChild.classList.add(this.insdom.packages.package.name);//package name class

      pele.appendChild(document.createElement('div')); //option lists
      for(let y=0;y<this.key.packages[x].opts.length;y++){
        pele.lastChild.appendChild(document.createElement('div')).innerText = this.key.packages[x].opts[y].name;
      }
      plist.appendChild(pele);
    }
  }
  GETpackages=()=>{
    var pele;
    var pac = null;
    pele = document.getElementsByClassName(this.insdom.packages.select)[0];
    if(pele!=undefined){
      pac = this.FINDpackage(pele.getElementsByClassName(this.insdom.packages.package.name)[0].innerText);
      pac.cost = 0;
      for(let x=0;x<pac.opts.length;x++){
        if(!isNaN(pac.opts[x].price)){
          //check for rate
          pac.cost += Number(pac.opts[x].price);
        }
      }
      switch(pac.rate){
        case 'sq':{
          pac.cost += Number(pac.price)*Number(this.data.build.info.sq);
          break;
        }
        case 'insq':{
          pac.cost += (pac.price*this.data.build.info.indepth)*this.data.build.info.sq;
        }
      }
    }
    this.data.build.package = pac;
  }

  FINDoption=(name)=>{
    if(this.key){
      for(let x=0;x<this.key.options.length;x++){
        if(this.key.options[x].name==name){
          return this.key.options[x];
        }
      }
    }
  }
  FINDpackage=(name)=>{
    if(this.key){
      for(let x=0;x<this.key.packages.length;x++){
        if(this.key.packages[x].name==name){
          return this.key.packages[x]
        }
      }
    }
  }
}

module.exports = {
  InsulBuild
}
