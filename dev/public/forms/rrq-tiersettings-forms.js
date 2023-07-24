
//  TIER  //

/*
*/
var distier=(t)=>{ //tier list map
  if(!t&&t==undefined){t={};}
  return{
    code:t.code||'',
    name:t.name||''
  }
}

var tiedom={
  cont:'tier-form-cont',
  list:'tier-list',
  info:{
    code:'tier-form-code',
    name:'tier-form-name',
  },
  featgroup:{
    list:'tier-form-featgroups'
  },
  actions:{
    save:'tier-form-save',
    delete:'tier-form-delete'
  }
}

var SETtierlist=(list,cont)=>{
  cont.innerHTML='';
  vgtables.BUILDdistable(list,cont,true,false,distier,SETtieredit);
}

var SETtieredit=(obj)=>{
  let form;
  for(let i in tiedom.info){
    document.getElementById(tiedom.info[i]).value = obj[i];
  }
  form=document.getElementById(tiedom.featgroup.list);
  form.innerHTML="";
  for(let fg in obj.featgroup){
    form.appendChild(document.createElement('div'));
    form.lastChild.appendChild(document.createElement('div'));
    form.lastChild.lastChild.innerText = fg;
    form.lastChild.appendChild(document.createElement('div'));

    form = form.lastChild.lastChild; //move to featgroup.list

    form.appendChild(document.createElement('input')); //title
    form.lastChild.value = obj.featgroup[fg].title;
    form.appendChild(document.createElement('input')); //picture
    form.lastChild.value = obj.featgroup[fg].pic;
    for(let fl in obj.featgroup[fg].feats){
      form.appendChild(document.createElement('input'));
      form.lastChild.value = obj.featgroup[fg].feats[fl];
      form.lastChild.title = fl;
    }
    form=form.parentNode.parentNode;
  }
}

var GETtieredit=()=>{
  let obj={};
  for(let i in quodom.tiers.form.info){
    obj[i] = document.getElementById(quodom.tiers.form.info[i]).value;
  }

  let list=document.getElementById(tiedom.featgroup.list).children;
  obj.featgroup={};
  for(let x=0;x<list.length;x++){
    obj.featgroup[list[x].children[0].innerText]={
      title:list[x].children[1].children[0].value,
      pic:list[x].children[1].children[1].value,
      feats:{}
    };
    for(let y=2;y<list[x].children[1].children.length;y++){
      obj.featgroup[list[x].children[0].innerText].feats[list[x].children[1].children[y].title]=list[x].children[1].children[y].value;
    }
  }
  return obj;
}


/////////////////////////
module.exports={
  tiedom,
  SETtierlist,
  SETtieredit,
  GETtieredit
}
