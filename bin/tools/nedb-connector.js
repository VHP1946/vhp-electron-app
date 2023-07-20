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

  QUERYdb=(query={})=>{
    return new Promise((resolve,reject)=>{
      this.docs.find(query,(err,docs)=>{
        if(err){return resolve({docs:[],err:err})}
        else if(docs){return resolve({docs:docs,err:null});}
        else{return resolve({docs:[],err:err})}
      });
    });
  }

  UPDATEdb=(query={},update={},options={})=>{
    return new Promise((resolve,reject)=>{
      this.docs.update(query,update,options,(err,numrep)=>{
        if(numrep>0){resolve({numrep:numrep,err:null})}
        else{resolve({numrep:numrep,err:err})}
      });
    });
  }

  INSERTdb=(docs)=>{
    return new Promise((resolve,reject)=>{
      if(docs){
        this.docs.insert(docs,(err,doc)=>{
          if(doc){resolve({doc:doc,err:null})}
          else{resolve({doc:null,err:err})}
        })
      }
    });
  }

  REMOVEdoc=(query={},multi=true)=>{
    return new Promise((resolve,reject)=>{
      this.docs.remove(query,{multi:multi},(err,num)=>{
        console.log(err,'error')
        if(!err){return resolve({err:false,num:num});}
        else{return resolve({err:err,num:0});}
      });
    });
  }
}

module.exports={
  NEDBconnect
}
