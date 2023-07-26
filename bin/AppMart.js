
const path = require('path');
const fs = require('fs');


const {NEDBconnect} = require('./tools/nedb-connector.js');
const {Core} = require("vhp-api");


let vapi=new Core({
      sync:false,
      auth:{user:'VOGCH',pswrd:'vogel123'},
      client:true,
      host:"http://18.191.223.80/",
      dev:{
          https:false,
          comments:false
      }
});//create connection to api
vapi.connected = true; //default to connected *taking to long to connect, need to look at a better way

/**
 * 
 * {
 *  vapipack:{
 *    db:String,
 *    ollect:String
 *  },
 *  
 *  locstore:{
 *    file:String,
 *    ensure:{
 *      fieldName:String,
 *      unique:Boolean
 *    }
 *  }
 * }
 * Mart with either(on connection) communicate with the api or,
 * communicate with local data. The mart will have 3 levels:
 * 
 * 1) api only (type=='api')-> the data is only needed when there is connection
 * 2) offline (type=='offline')-> Is read only. Data is "refreshed" when there is connection. The dataset
 * can afford to be stale.
 * 3) backup (type=='backup')-> the data is always need, both on/off line. Actions on the data
 * are done both locally and in the api.
 * 
 * 
 * 
 * 
 */
module.exports = class AppMart{
    /**
     * 
     * @param {*} param0 
     */
    constructor({
      vapihpack=null,
      data={
        type:"online", //'both','sync'
        sync:true //when 
      },
      root='',
      locstore={
        file:'',
        ensure:null
      }
    }){
      //ensure local mart root is created
        this.root = path.join(root,'mart'); //root to app folder mart
        try{fs.mkdirSync(this.root);}catch{}//ensure folder exist
        this.config=null;
        this.setsfile = path.join(root,'storestatus.json');
        try{this.config = require(this.setsfile);}//try to get settings file
        catch{//create the file
            this.config = {
              cansync:true, //user allowed to sync to master
              needsync:false, //user needs to sync to master
              connected:true //user has internet connection
            }
            fs.writeFileSync(this.setsfile,JSON.stringify(this.config));
        }
        //ensure local file existss
        this.file = locstore.file;  
        
        this.vapi=vapi;//share connection to api
        this.vapihpack = vapihpack;//store information for database


        this.data = data;

        this.local=null;
        this.changes=null;

        if(data.type!='api'){
          this.local=new NEDBconnect(path.join(this.root,this.file),locstore.ensure);//connect to/create a data file
        }
        if(data.type=='backup'){
          this.changes=new NEDBconnect(path.join(this.root,'/changeslogs/',this.file),locstore.ensure);//connect/create a changelog file for the above
        }

        if(data.sync){
          this.SYNCdata().then(result=>{console.log('Sync ',result)});
        }//sync the requested local data with the api
        
    }

    /**ROUTE Store
     * **Need to change name to => ROUTEstore
     * will only handle the orchestration of 
     * data to either local mart OR api
     * 
     * @param {*} pack 
     * @returns 
     */
    ROUTEstore=(pack={})=>{
      return new Promise((resolve,reject)=>{
        if(this.data.type==='offline'){
          if(this.local){//ensure local is setup
            if(pack.method.toUpperCase()==='QUERY'){
              this.local.QUERYdb(pack.options).then(({success,err,result})=>{
                if(err){return resolve(null)}//change fail method
                if(result){return resolve(result)}
                return resolve([]);
              });
            }else{return resolve({success:false,msg:'this is read only'})}
          }else{return resolve({success:false,msg:'storage not setup'})}
        }else{
          if(this.vapi.connected){
            let p = {//prep pack
              ...this.vapihpack,
              ...pack
            }
            console.log(p);
            this.vapi.SENDrequest({//to api
              pack:p,
              route:'STORE'
            }).then(answr=>{
              return resolve(answr);//backup if need
            })
          }else{return resolve(this.ROUTEmart(pack));}
        }
      });
    }

    ROUTEmart=(pack={})=>{
      return new Promise((resolve,reject)=>{
        let lmart = null;
        switch(pack.method.toUpperCase()){
          case 'QUERY':{
            lmart = this.local.QUERYdb(pack.options);
            break;
          }
          case 'REMOVE':{
            lmart = this.REMOVEdoc(pack.options);
            break;
          }
          case 'INSERT':{
            lmart = this.INSERTdoc(pack.options);
            break;
          }
          case 'UPDATE':{
            lmart = this.UPDATEdoc(pack.options);
          }
        }
        if(lmart){
          lmart.then(answr=>{
            if(this.type==='sync'){
              console.log('save to change log')
            }
            return resolve(answr);
          }).catch(err=>{return resolve({success:false,msg:err})})
        }else{return resolve({success:false,msg:'not a request'})}
      });
    }

    /**
     * THis is a query on local, assuming local has
     * all the informaiton needed. Need to exapnad
     * this to query the api in the case of connection
     * @param {*} flts 
     * @returns 
     */
    QUERYlocal=({query={}})=>{
      return new Promise((resolve,reject)=>{
        this.local.QUERYdb(query).then(({err,result,success})=>{
          if(err){return resolve(null)}
          if(result){return resolve(result)}
          return resolve([]);
        });
      });
    }
  
    UPDATEdoc=({query={},update={},options={}})=>{
      return new Promise((resolve,reject)=>{
        //check if connected
        //if connected: reach out to api
        // if not: send to localmart





         
        /*
        this.local.UPDATEdb(query,update,options).then(({err,numrep})=>{
          console.log('--UPDATE TOP--')
          console.log('AFTER UPDATE');
          console.log('ERROR > ',err);
          console.log('result >',numrep);
          if(numrep&&numrep>0){
            this.QUERYlocal(query).then(docs=>{
              if(docs){
                this.SENDdocs({
                  method:'update',
                  options:{
                    query:query,
                    update:update,
                    options:options
                  }
                },docs).then(({connected,vapi,changelog})=>{
                  console.log(`--------------------\nSEND Report => connected:${connected} vapi:${vapi} changelog:${changelog}\n--------------------`)
                });
              }else{return resolve({numrep:numrep,err:'Document(s) where only updated locally. They could not be added to change log. REUPDATE to fix'})}
              return resolve({numrep:numrep,err:null})
            });
          }else{return resolve({numrep:numrep,err:err})}
        })
        */
      })
    }
  
    INSERTdoc=({docs=[]})=>{
      return new Promise((resolve,reject)=>{
        if(docs){
          this.local.INSERTdb(docs).then(({err,result,success})=>{
            console.log('Local Insert >', doc);
            if(doc){
              this.SENDdocs({
                method:'insert',
                options:{
                  docs:doc
                }
              },doc).then(({connected,vapi,changelog})=>{
                console.log(`--------------------\nSEND Report => connected:${connected} vapi:${vapi} changelog:${changelog}\n--------------------`)
              });
              console.log('LEAVING INSERT')
              return resolve({doc:doc,err:null});
            }
            else{return resolve({doc:null,err:err})}
          })
        }
      });
    }
  
    REMOVEdoc=({query={},multi=false})=>{
      return new Promise((resolve,reject)=>{
        this.QUERYlocal(query).then(docs=>{
          this.local.REMOVEdoc(query,{multi:multi}).then(({err,num})=>{
            if(!err){
              this.SENDdocs({
                method:'remove',
                options:{
                  query:query,
                  multi:multi
                }
              },docs).then(({connected,vapi,changelog})=>{
                console.log(`--------------------\nSEND Report => connected:${connected} vapi:${vapi} changelog:${changelog}\n--------------------`)
              });
              return resolve(true);
            }else{return resolve(false);}
          });
        });
      });
    }

    REFRESHlocal=({pack={}})=>{
      return new Promise((resolve,reject)=>{
        if(this.vapi.connected){
          this.vapi.Request(pack).then(result=>{
            if(result){
              this.local(i)
            }else{return resolve({success:false,msg:"cannot find"})}
          });
        }else{return resolve({success:false,msg:"not connected"})}
      });
    }

    /**
     * Attempts to sync the local data with the data in the api
     */
    SYNCdata=()=>{
      return new Promise((resolve,reject)=>{
        if(this.vapi.connected){
          this.vapi.SENDrequest({
            pack:{
              ...this.vapihpack,
              method:'QUERY',
              options:{query:{}}
            },
            route:'STORE'
          }).then(list=>{
            if(list.success){
              console.log('SYNC list ',list.result);
              this.local.REMOVEdoc({
                query:{},
                multi:true
              }).then(({err,result,success})=>{
                if(err){return resolve({success:false,msg:err})}
                else{
                  this.local.INSERTdb({docs:list.result}).then(({err,success,result})=>{
                    if(err){return resolve({success:false,msg:err})}
                    else{return resolve({success:true,msg:this.file+' has synced'})}
                  });
                }
              })
            }else{return resolve({success:false,msg:'could not reach data'})}
          })
        }else{return resolve({success:false,msg:'not connected'})}
      });
    }
}