
const path = require('path');
const fs = require('fs');

const {NEDBconnect} = require('./tools/nedb-connector.js');
const MartChangeLog=require('./tools/change-log.js');
const {Core} = require("vhp-api");


let vapi=new Core({
      sync:false,
      auth:{user:'VOGCH',pswrd:'vogel123'},
      client:true,
      host:"http://18.191.223.80/",//"http://localhost:8080/",//
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
      },
      connection={}
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
        
        this.vapi= vapi;//share connection to api
        this.vapihpack = vapihpack;//store information for database

        this.data = data;

        this.local=null;
        this.changes=null;

        if(data.type!='api'){
          this.local=new NEDBconnect(path.join(this.root,this.file),locstore.ensure);//connect to/create a data file
        }
        if(data.type=='backup'){
          this.changes=new MartChangeLog({
            vapi:this.vapi,
            vapipack:this.vapihpack,
            locstore:locstore,
            root:this.root,
            file:this.file
          });//NEDBconnect(path.join(this.root,'/changeslogs/',this.file),locstore.ensure);//connect/create a changelog file for the above
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
    ROUTEstore(pack={},options={}){
      return new Promise((resolve,reject)=>{
        if(this.data.type==='offline'){
          if(this.local){//ensure local is setup
            if(pack.method.toUpperCase()==='QUERY'){
              return resolve(this.local.QUERYdb(pack.options));
            }else{return resolve({success:false,msg:'this is read only'})}
          }else{return resolve({success:false,msg:'storage not setup'})}
        }else{
          if(this.vapi.connected){
            console.log('Connected',vapi.connected);
            let p = {//prep pack
              ...this.vapihpack,
              ...pack
            }

            let ready = null;

            if(this.data.type==='backup'){
              ready = this.changes.staleChanges(); //check/clean stale changes
            }else{ready = new Promise((resolve,reject)=>{resolve(true);})}

            ready.then(state=>{
              if(state){
                this.vapi.SENDrequest({//to api
                  pack:p,
                  route:'STORE'
                }).then(answr=>{
                  console.log(options,pack,this.type);
                  if(answr.success && pack.method!='QUERY'){
                    this.ROUTElocal(pack).then(locAdjust=>{
                      console.log('Adjusted non queries locally ',locAdjust);
                    });
                  }
                  if(answr.success && this.data.type==='backup' && options.refresh && pack.method=='QUERY'){//refresh data
                    console.log('REFRESH request ');
                    this.local.REMOVEdoc({
                      query:{}
                    }).then(clearRes=>{
                      console.log('REFRESH remove Result ',clearRes);
                      if(clearRes.success){
                        this.local.docs.persistence.compactDatafile();
                        this.local.INSERTdoc({
                          docs:answr.result
                        }).then(ianswr=>{
                          console.log("REFRESH INSERT ",ianswr);
                        });
                      }else{
                        console.log('Could not clear list');
                      }
                    })
                  }
                  if(!answr.success){
                    return resolve(this.ROUTElocal(pack));
                  }else{return resolve(answr)}
                })
              }else{return resolve({success:false,msg:'Item had a remove change attached to it',result:null})}
            });
          }else{return resolve(this.ROUTElocal(pack));}
        }
      });
    }

    ROUTElocal=(pack={})=>{
      return new Promise((resolve,reject)=>{
        let lmart = null;
        let logneed=true;
        let doc;
        switch(pack.method.toUpperCase()){
          case 'QUERY':{
            lmart = this.local.QUERYdb(pack.options);
            logneed=false;//queries don't need to be logged
            break;
          }
          case 'REMOVE':{
            lmart = this.local.REMOVEdoc(pack.options);
            break;
          }
          case 'INSERT':{
            lmart = this.local.INSERTdoc(pack.options);
            break;
          }
          case 'UPDATE':{
            lmart = this.local.UPDATEdoc(pack.options);
          }
        }
        if(lmart){
          lmart.then(answr=>{
            console.log('LOCAL MART > ',answr);
            if(this.data.type === 'backup' && !this.vapi.connected){
              if(logneed){console.log('save to change log');
                this.changes.LOGchange(pack.method.toUpperCase(),pack.options.query,pack.options.update?pack.options.update:undefined).then(logres=>{
                  console.log('Log Change After Local Update >',logres);
                });
              }
            }
            return resolve(answr);
          }).catch(err=>{return resolve({success:false,msg:err,result:null})})
        }else{return resolve({success:false,msg:'not a request',result:null})}
      });
    }

    /**
     * Attempts to sync the local data with the data in the api
     */
    SYNCdata=()=>{
      return new Promise((resolve,reject)=>{
        if(this.vapi.connected){
          //attempt to square changes
          if(this.data.type==='backup'){
            this.changes.syncChanges().then(answr=>{
              console.log('DONE with Changes ',answr)
              return resolve(answr);
            })
          }else{
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
                    this.local.INSERTdoc({docs:list.result}).then(({err,success,result})=>{
                      if(err){return resolve({success:false,msg:err})}
                      else{return resolve({success:true,msg:this.file+' has synced'})}
                    });
                  }
                })
              }else{return resolve({success:false,msg:'could not reach data'})}
            })
          }
        }else{return resolve({success:false,msg:'not connected'})}
      });
    }
}