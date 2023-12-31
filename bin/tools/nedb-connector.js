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
                if(err){return resolve({success:false,result:[],msg:err})}
                else if(docs){return resolve({success:true,result:docs,msg:null});}
                else{return resolve({success:false,result:[],msg:err})}
            });
        });
    }

    UPDATEdoc=({query={},update={},options={}})=>{
        return new Promise((resolve,reject)=>{
            let resp={
                modifiedCount:0,
                upsertedId:null,
                upsertedCount:0,
                matchedCount:0
            }
            this.docs.find(query,(err,docs)=>{
                if(docs.length!=0){
                    resp.matchedCount=docs.length;
                    this.docs.update(query,update,options,(err,numrep)=>{
                        resp.modifiedCount=numrep;
                        if(numrep>0){resolve({success:true,result:resp,msg:null})}
                        else{resolve({success:false,result:resp,msg:err})}
                    });
                }else{
                    this.INSERTdoc({docs:docs}).then(({success,result,err})=>{
                        if(success){
                            resp.upsertedId=true;
                            resp.upsertedCount=result.length;
                            resolve({success:true,result:resp,msg:null})
                        }
                        else{resolve({success:false,result:resp,msg:err})}
                    })
                }
            })
        });
    }

    INSERTdoc=({docs})=>{
        return new Promise((resolve,reject)=>{
        if(docs){
            this.docs.insert(docs,(err,doc)=>{
                if(doc){
                    let a;
                    try{a=[...doc]}
                    catch{a=[doc]}
                    resolve({success:true,result:a,err:null})}
                else{resolve({success:false,result:null,err:err})}
            })
        }else{resolve({success:false,result:null,err:'docs not valid'})}
        });
    }

    REMOVEdoc=({query={},multi=true})=>{
        return new Promise((resolve,reject)=>{
        this.docs.remove(query,{multi:multi},(err,num)=>{
            if(!err){return resolve({success:true,msg:null,result:{deletedCount:num}});}
            else{return resolve({success:false,msg:err,result:0});}
        });
        });
    }
}

module.exports={
  NEDBconnect
}
