

module.exports = class MartChangeLog{
    constructor(){

    }



    /*
      Only manages one document at a time. will need to expand
      to handle and array of requested changes. This is the case
      because we need to run a check on the 
    */
    SENDdocs=(pack,docs)=>{
        return new Promise((resolve,reject)=>{
            if(docs){if(docs.length&&docs.length===1){docs=docs[0]}}
            else{docs={_id:null}}
    
            console.log('DOCUMENT TO CHECK >',docs);
            if(this.vapi.connected){
                //check the change log
                this.changes.QUERYdb({id:docs._id}).then(changedoc=>{
                console.log('FOUND DOCUMENT >',changedoc)
                let found = changedoc.docs.length>0?changedoc.docs[0]:false;
                if(found){
                    if(found.type==='insert'){
                    pack.method='insert',
                    pack.options={
                        docs:docs
                    }
                    }
                    this.changes.REMOVEdoc({id:docs._id}).then(remove=>{
                    console.log('Attempt to remove change doc',remove);
                    })
                }
                this.vapi.Request({
                    pack:{
                    ...pack,
                    ...this.vapihpack
                    }
                }).then(answr=>{
                    /*Need to do more error checking
                    - handling the different method checks
                        * insert
                        * update
                        * remove
                    */
                    if(answr==undefined||answr.err){
                    console.log('answr is being relogged',answr)
                    this.LOGchanges(pack.method,docs).then(answr=>{
                        console.log(`Send failed > Change Log ${pack.method} > ${answr}`);
                        resolve({connected:true,changelog:true,vapi:false});
                    });
                    }else{resolve({connected:true,changelog:false,vapi:true});}
                });
                })
            }else{
                this.LOGchanges(pack.method,docs).then(answr=>{console.log(`NOT CONNECTED > Change Log ${pack.method} > ${answr}`);});
                resolve({connected:false,changelog:true,vapi:false});
            }
        });
    }
  
    SYNCFROMmaster=(flts={})=>{
        return new Promise((resolve,reject)=>{
            console.log('CONNECTION >',this.vapi.connected);
            this.SYNCTOmaster().then(({ran,stats})=>{
            console.log(`SYNCTO ran:${ran} \t stats=> ${stats}`);
            if(ran){
                this.vapi.Request({
                pack:{
                    ...this.vapihpack,
                    method:'query',
                    options:{query:flts}
                }
                }).then(nlist=>{return resolve(this.REFRESHlocal(nlist));});
            }else{return resolve(false);}
            })
        });
    }
      
    /**
     * 
     * @param {*} list 
     * @returns 
     */
    SYNCTOmaster=()=>{
        return new Promise((resolve,reject)=>{
            let syncstat={
            insert:{
                try:0,
                success:0,
                failed:0,
                left:[],
                done:[]
            },
            remove:{
                try:0,
                success:0,
                failed:0,
                left:[],
                done:[]
            },
            update:{
                try:0,
                success:0,
                failed:0,
                left:[],
                done:[]
            }
            }
            let ran = false;
            let skipper = 0;
            if(this.vapi.connected){
            ran=true;
            this.QUERYchanges({}).then(list=>{
                console.log('List to Sync',list)
                if(list&&list.length!==0){
                console.log('List will sync');
                for(let x=0,l=list.length;x<l;x++){
                    try{syncstat[list[x].type].try++;}catch{}
                    skipper=skipper+2000;
                    //setTimeout(()=>{
                        let runner = null;
                        console.log('RUNNER >',x,'\n>',list[x].type)
                        switch(list[x].type){
                        case 'insert':{
                            //syncstat.update.try++;
                            runner=this.vapi.Request({
                            pack:{
                                ...this.vapihpack,
                                method:list[x].type,
                                options:{
                                docs:list[x].doc
                                }
                            }
                            });
                            break;
                        }
                        case 'update':{
                            //syncstat.update.try++;
                            runner=this.vapi.Request({
                            pack:{
                                ...this.vapihpack,
                                method:list[x].type,
                                options:{
                                query:{_id:list[x].id},
                                update:{$set:list[x].doc},
                                options:{}
                                }
                            }
                            });
                            break;
                        }
                        case 'remove':{
                            //syncstat.remove.try++;
                            runner = this.vapi.Request({
                            pack:{
                                ...this.vapihpack,
                                method:list[x].type,
                                options:{
                                query:{_id:list[x].id},
                                multi:false
                                }
                            }
                            });
                            break;
                        }
                        }
                        if(runner){
                        runner.then(answr=>{
                            console.log('RECIEVE > ',x,'\n>',list[x],'\n> ',answr)
                            if(answr.err){
                            syncstat[list[x].type].failed++;
                            syncstat[list[x].type].left.push(list[x])
                            }else{
                            syncstat[list[x].type].success++;
                            syncstat[list[x].type].done.push(list[x]._id);
                            }
                            if(this.CHECKsyncchanges(syncstat)){return resolve({ran:ran,stats:syncstat})}
                            else{console.log('NOT DONE SYNCING >', x)}
                        });
                        }
                    //},50+skipper)
                    }
                }else{return resolve({ran:ran,stats:syncstat})}
            });
            }else{return resolve({ran:ran,stats:syncstat})}
        })
    }
      

    REFRESHlocal=(list=null)=>{
        return new Promise((resolve,reject)=>{
        this.local.REMOVEdoc({},{multi:true}).then(({err,num})=>{
            if(!err){
            if(list){//list to refresh
                this.local.INSERTdb(list).then(({err,doc})=>{
                if(!err){return resolve(doc);}
                else{return resolve(false)}
                });
            }else{return resolve(true)}
            }else{return resolve(true)}
        });
        })
    } 

    /**
     * 
     * @param {*} stats 
     * @returns 
     */
    CHECKsyncchanges(stats){
        let clean = [];
        for(let s in stats){
            if(stats[s].try!==(stats[s].success+stats[s].failed)){return false}
            else{clean=clean.concat(stats[s].done)}
        }
        console.log('List to Clean >',clean);
        
        for(let x=0,l=clean.length;x<l;x++){
            this.changes.REMOVEdoc({_id:clean[x]},true).then(result=>{//clean log
            this.changes.docs.persistence.compactDatafile()
            console.log('REPORT RESULT >',result);
            })
        }
        //do something with "left" list
        return true;
    }

    QUERYchanges=(flts={})=>{
        return new Promise((resolve,reject)=>{
            this.changes.QUERYdb(flts).then(({docs,err})=>{
                if(err){return resolve(false)}
                if(docs){return resolve(docs)}
                return resolve([]);
            })
        });
    }
    LOGchanges(type,list){
        return new Promise((resolve,reject)=>{
            let count=0;
            if(list){
            if(list.length){
            console.log('list of changes >',list);
                for(let x=0,l=list.length;x<l;x++){
                this.LOGchange(type,list[x]._id,list[x]).then(answr=>{
                    console.log('LOGGED CHANGE >',answr);
                    count++;
                    console.log('Change Count > ',count,'out of >',l)
                    if(l===count){return resolve(true)}
                });
                }
            }else{
                this.LOGchange(type,list._id,list).then(answr=>{
                return resolve(true);
                });
            }
            }else{return resolve(false)}
        });
    }
    LOGchange(type=null,id=null,doc={}){
        return new Promise((resolve,reject)=>{
            if(id&&type){
            console.log("CHANGE ID >",id);
            let types={
                insert:true,
                remove:true,
                update:true,
            }
            this.QUERYchanges({id:id}).then((docs)=>{
                console.log('--------------------------------')
                console.log(`LOOKING to ${type} id ${id}`);
                console.log('CHANGE LOG >',docs);
                let insert=true;
                if(types[type]){//check if type
                if(docs){
                    if(docs.length!==0){
                    if(type==='remove'){
                        //if remove and value of type found in query is 'insert', we
                        // could remove the item all together.
                        insert=false;
                        if(docs[0].type==='insert'){
                        console.log('ITEM TO REMOVE WAS NEW TO LOCAL');
                        console.log('CHANGE LOG REMOVE ITEM FROM CHANGE LOG');
                        this.changes.REMOVEdoc({id:id}).then(({num,err})=>{
                            console.log(`CHANGE REMOVED id ${id} > ${num}`);
                            console.log(`ERROR: ${err}`);
                            if(err){return resolve(false)}
                            return resolve(true);
                        });
                        }else{
                        console.log('CHANGE LOG REMOVE ITEM')
                        docs[0].type=type;
                        this.changes.UPDATEdb({id:id},{$set:docs[0]},{}).then(({err,numrep})=>{
                            console.log(`CHANGE UPDATE> ${type} > ${numrep}`);
                            console.log(`ERROR: ${err}`);
                            if(err){return resolve(false)}
                            return resolve(true)
                        })
                        }
                    }else if(type==='update'){
                        insert=false
                        console.log('CHANGE LOG UPDATE ITEM')
                        docs[0].doc=doc;

                        this.changes.UPDATEdb({id:id},{$set:docs[0]},{}).then(({err,numrep})=>{
                        console.log(`CHANGE UPDATE > ${type} > ${numrep}`);
                        console.log(`ERROR: ${err}`);
                        if(err){console.log(err);return resolve(false)}
                        return resolve(true);
                        });
                    }
                    }
                }
                if(insert){
                    this.changes.INSERTdb({
                        type:type,
                        id:id,
                        doc:doc
                    }).then(({err,doc})=>{
                        console.log(`CHANGE INSERT> ${type} > ${doc}`);
                        console.log(`ERROR: ${err}`);
                        if(err){return resolve(false)}
                        return resolve(true);
                    });
                }
                }else{console.log('NO MATCHING TYPE');return resolve(false);}
            });
            }else{return resolve(false)}
        });
    } 

}