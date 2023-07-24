
/* Create new quote
    Creates a new and unique quote number
    (appname)-(getTime())
*/
var nxtquotenum=()=>{
    return appset.name + '-' + new Date().getTime() + '-BETA';
}
/*MOVE into mart*/
ipcMain.on(quoteroutes.syncquotesmaster,(eve,data)=>{
    if(quotedb.ustoresettings.cansync){
      quotedb.mart.SYNCTOmaster().then(({ran,stats})=>{
        quotedb.ustoresettings.needsync=ran;
        console.log('SYNCING TO CALL >',stats);
      });
    }
    quotedb.SaveUStoreSettings();
});
// Titlebar Request
ipcMain.on('view-minimize',(eve,data)=>{
    BrowserWindow.getFocusedWindow().minimize();
  });

/** */
module.exports=(vhpapp)=>{
  return{
    loadQuote:(eve,data)=>{
        let isopen = false;
        if(data.id&&data.id!=undefined){ //check data.id
            if(!isopen){
            quotev.push({id:data.id,view:viewtools.loader(controlsroot+'quoter.html',stdwidth,stdheight,false,false,'hidden')});
            eve.sender.send(qdashroutes.loadquote,{msg:'Quote -'+data.id+'- was loaded',id:data.id,name:''})
            }
        }else{
            eve.sender.send(qdashroutes.loadquote,{msg:'No quote to open...',id:null});
        }
    },
    getQuote:(eve,data)=>{
        if(data!=undefined && data.name!=''){
          let nquote = aquote({
            id:nxtquotenum(),
            name:data.name,
            estimator:au.auser.uname,
            dept:appset.dept,
            customer:data.customer,
            info:{
              systems:[],
              tracking:{},
              siteinfo:{},
              key:quotedb.GetPriceKey(au.auser.cuser.spdrive), //add price key to quote
            }
          });
          qflows.INITquotefolder(nquote,au.auser);
          quotedb.mart.INSERTdoc(nquote).then(
            (res)=>{
              if(res.doc){eve.sender.send(qdashroutes.createquote,{msg:'New Quote Created',quote:res.doc})}
              else{eve.sender.send(qdashroutes.createquote,{msg:'New Quote was NOT Created',quote:null})}
            }
          )
        }else{eve.sender.send(qdashroutes.createquote,{msg:'Must enter a Quote Name',quote:null})}
    },
    createQuote:(eve,data)=>{
        if(data!=undefined && data.name!=''){
          let nquote = aquote({
            id:nxtquotenum(),
            name:data.name,
            estimator:au.auser.uname,
            dept:appset.dept,
            customer:data.customer,
            info:{
              systems:[],
              tracking:{},
              siteinfo:{},
              key:quotedb.GetPriceKey(au.auser.cuser.spdrive), //add price key to quote
            }
          });
          qflows.INITquotefolder(nquote,au.auser);
          quotedb.mart.INSERTdoc(nquote).then(
            (res)=>{
              if(res.doc){eve.sender.send(qdashroutes.createquote,{msg:'New Quote Created',quote:res.doc})}
              else{eve.sender.send(qdashroutes.createquote,{msg:'New Quote was NOT Created',quote:null})}
            }
          )
        }else{eve.sender.send(qdashroutes.createquote,{msg:'Must enter a Quote Name',quote:null})}
    },
    saveQuote:(eve,data)=>{
        if(data.quote.id && data.quote.id!=undefined){
          data.quote.lastdate = new Date().toISOString().split('T')[0]; //update last Date
          quotedb.mart.UPDATEdoc({id:data.quote.id},{$set:data.quote}).then(
            (res)=>{
              if(res.numrep>0){eve.sender.send(quoteroutes.savequote,{msg:'Quote WAS Saved',quote:data.quote})}
              else{eve.sender.send(quoteroutes.savequote,{msg:'Quote WAS NOT Saved',quote:null});}
            }
          )
        }
    },
    sellQuote:(eve,data)=>{
        if(data && data!=undefined){
      
        // Do we still want to check to make sure a contract file exists?
          data.subdate = new Date().toISOString().split('T')[0];
          //data.sold = true;
          data.status = 'O';  // should already be set anyway
          data.progress = 'submitted';
      
          quotedb.mart.UPDATEdoc({id:data.id},{$set:data}).then(
            (update)=>{
              quotedb.mart.QUERYlocal().then(
                (list)=>{eve.sender.send(qdashroutes.getuserquotes,{msg:'Update Quotes',quotes:list});}
              )
            }
          );
          eve.sender.send(quoteroutes.sellquote,{msg:'Quote HAS been marked sold',status:true})
      
          /*
          fs.readdir(path.join(au.auser.cuser.spdrive,data.froot,qflows.paths.jobsubfolders.contracts),(err,files)=>{
            if(!err && files.length>0){
              qflows.MOVEquotefolder(data,au.auser,'S').then(
                (quote)=>{
                  if(quote){
                    quotedb.mart.UPDATEdoc({id:quote.id},{$set:quote}).then(
                      (update)=>{
                        quotedb.mart.QUERYlocal().then(
                          (list)=>{eve.sender.send(qdashroutes.getuserquotes,{msg:'Update Quotes',quotes:list});}
                        )
                      }
                    );
                    eve.sender.send(quoteroutes.sellquote,{msg:'Quote HAS been marked sold',status:true})
                  }
                  else{eve.sender.send(quoteroutes.sellquote,{msg:'Quote was NOT sold',status:false})}
                }
              )
            }else{eve.sender.send(quoteroutes.sellquote,{msg:'Quote DOES NOT have a contract',status:false})}
          });
          */
        }else{eve.sender.send(quoteroutes.sellquote,{msg:'Quote was NOT sold',status:false})}
    },

    createContract:(eve,data)=>{
        if(data.quote!=undefined && data.contract!=undefined){
          qflows.UPDATEcontract(data.contract,data.quote.froot,au.auser).then(
            (stat)=>{
              if(stat){
                eve.sender.send(quoteroutes.createcontract,{msg:'Contract Created',status:true,quote:data.quote});
              }
              else{eve.sender.send(quoteroutes.createcontract,{msg:'Contract NOT Updated, Close contract file',status:false})}
            }
          );
        }
    },
    refreshQuoteKey:(eve,data)=>{
        let key = quotedb.GetPriceKey(au.auser.cuser.spdrive);
        if(key&&key!=undefined){
          eve.sender.send(quoteroutes.refreshquotekey,{msg:'Key was updated!',key:key});
        }else{eve.sender.send(quoteroutes.refreshquotekey,{msg:'Key is not available',key:null})}
    }
  }
}