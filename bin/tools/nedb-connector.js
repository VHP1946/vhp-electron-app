/**
 * Documentation missing
 */
var DataStore = require('nedb');


class NEDBconnect{
  constructor(setup,ensure=null){
    this.docs = new DataStore(setup); //connect to user quote
    if(ensure&&ensure!=undefined){this.docs.ensureIndex(ensure)}
    this.docs.loadDatabase();
  }

  QUERYdb=({query={}})=>{
    return new Promise((resolve,reject)=>{
      this.docs.find(query,(err,docs)=>{
        if(err){return resolve({success:false,result:[],err:err})}
        else if(docs){return resolve({success:true,result:docs,err:null});}
        else{return resolve({success:false,result:[],err:err})}
      });
    });
  }

  UPDATEdoc=({query={},update={},options={}})=>{
    return new Promise((resolve,reject)=>{
      this.docs.update(query,update,options,(err,numrep)=>{
        if(numrep>0){resolve({success:true,result:numrep,err:null})}
        else{resolve({success:false,result:numrep,err:err})}
      });
    });
  }

  INSERTdoc=({docs})=>{
    return new Promise((resolve,reject)=>{
      if(docs){
        this.docs.insert(docs,(err,doc)=>{
          if(doc){resolve({success:true,result:doc,err:null})}
          else{resolve({success:false,result:null,err:err})}
        })
      }else{resolve({success:false,result:null,err:'docs not valid'})}
    });
  }

  REMOVEdoc=({query={},multi=true})=>{
    return new Promise((resolve,reject)=>{
      this.docs.remove(query,{multi:multi},(err,num)=>{
        if(!err){return resolve({success:true,err:false,result:num});}
        else{return resolve({success:false,err:err,result:0});}
      });
    });
  }
}

module.exports={
  NEDBconnect
}
