var {aquote}=require('./repo/ds/quotes/vogel-quote.js');
/* Initial Setup
    - connect to data

*/
const  path = require('path'),
       fs = require('fs'),
       reader = require('xlsx');
var App = new require('../app/app.js');

var quotev=[] //holds open quotes {id:'',view:BrowserWindow()} //NOT USING
var qflows = require('./back/workflows/rrq-quoteflows.js');
var quotedb =require('./db/dbsetup.js');
// Get WindowKey class
/*
var {
    getProductCode,
    getProductSheets,
    WindowKey
} = require('../js/keymaker.js')


/** On close
 * function to run on the applications closes
 * 
 * @param {Electron App Object} app 
 */
var ONclose = (app)=>{
    qflows.GARBAGEquotefolders().then(done=>{
        console.log('FINISHED',done);
        quotedb.mart.SYNCTOmaster().then(answr=>{
        console.log('SYNC RESULTS >',answr);
        app.exit();
        });
    });
}


//quotedb.mart.vapi.Ping().then(//ping server
//  answr=>{
//    console.log('PING >',answr);
//    if(answr){
//      quotedb.mart.SYNCTOmaster().then(answr=>{
//        console.log('SYNC to master on Start up >',answr);
//      })
//    }
//  }
//)

// View Routes /////////////////////////////////////////////////////////////////

// Request login screen

var GOTOlogin = (eve,data)=>{
    return new Promise((resolve,reject)=>{
        /*
        quotedb.mart.SYNCTOmaster().then(answr=>{//attempt to sync changes
            console.log('LOG OUT SYNCING >',answr);
            resolve(answr);
        });
        */
        return resolve(true);
    });
}
var GOTOdash = (eve,data)=>{

}
var GOTOpresentation = (eve,data)=>{
    if(data.quote&&data.quote!=undefined){
        quotepresi = data.quote;
        return {msg:'LOADING',load:true};//eve.sender.send(navroutes.gotopresi,{msg:'LOADING'})
    }else{return {msg:'NO QUOTE',load:false};}
}

/* DASH routes  ////////////////////////////////////////////////////////
*/

  
/* Create new quote
    Creates a new and unique quote number
    (appname)-(getTime())
*/
var nxtquotenum=()=>{
    return appset.name+'-'+ new Date().getTime();
}

/** Create Quote
 *  
 *  Creates a quote useing the aquote structure. It then creates a folder
 *  for the quote docs to be stored and saves the quote to the database.
 * 
 *  NEEDS
 *  - au (app user information)
 * 
 * @param {Object} eve 
 * @param {
 *      name:String -> Quote Name
 *      estimator:String -> Quote Esitmator
 *      dept:String
 *      customer:Object -> Customer Object for Quote
 * } data 
 * @returns 
 */
var CREATEquote = (eve,data)=>{
    return new Promise((resolve,reject)=>{
        if(data!=undefined && data.name !=''){
            let nquote = aquote({
                id:nxtquotenum(),
                name:data.name,
                estimator:'',//Tapp.auser.uname,//data.estimator
                dept:'',//Tapp.appset.dept,//data.dept
                customer:data.customer,
                info:{
                    key:quotedb.GetPriceKey(Tapp.cuser.spdrive).key, //add price key to quote
                }
            });
            
            qflows.INITquotefolder(nquote,Tapp.auser);
            quotedb.mart.INSERTdoc(nquote).then(
                (res)=>{
                    if(res.doc){return resolve({msg:'New Quote Created',quote:res.doc});}
                    else{return resolve({msg:'New Quote was NOT Created',quote:null});}
                }
            )
        }else{return resolve({msg:'Must enter a Quote Name',quote:null});}
    })
}

/** Find / Retrieve a quote
 * 
 *  Searches for a requested quote and sends it back
 *  to the client.
 * 
 * @param {Object} eve 
 * @param {Object} data 
 * @returns 
 */
var FINDquote = (eve,data)=>{
    return new Promise((resolve,reject)=>{
        if(data.id&&data.id!=undefined){
            quotedb.mart.QUERYlocal({id:data.id}).then(
                (doc)=>{
                    if(doc){
                        if(doc.length>0){return resolve({msg:'Quote Loading..',quote:doc[0]});}
                        else{return resolve({msg:'Quote WAS NOT Found...',quote:null});}
                    }else{return resolve({msg:'No Quote',quote:null});}
                }
            )
        }else{return resolve({msg:'No Quote',quote:null});}
    })
}

/** Save a quote
 *  
 *  Takes a quote (passed) and saves it to the database and also
 *  prints / saves the summary.
 * 
 * @param {Object} eve 
 * @param {
 *      quote:Object
 * } data 
 * @returns 
 */
var SAVEquote = (eve,data)=>{
    return new Promise((resolve,reject)=>{
        if(data.quote.id&&data.quote.id!=undefined){
            data.quote.lastdate = new Date().toISOString().split('T')[0]; //update last Date
            quotedb.mart.UPDATEdoc({id:data.quote.id},{$set:data.quote}).then(
                (res)=>{
                    if(res.numrep>0){return resolve();}
                    else{return resolve();}
                }
            )
            PRINTscreen(eve.sender,path.join(Tapp.cuser.spdrive,data.quote.froot),data.quote.name,false);
        }
    });
}

/** Delete a quote
 * 
 *  Takes a quote (passed) and deletes it from the database and also
 *  removes the folder where the documents are being saved.
 * 
 * @param {Object} eve 
 * @param {String} data -> id of the quote to delete
 * @returns 
 */
var DELETEquote = (eve,data)=>{
    return new Promise((resolve,reject)=>{
        quotedb.mart.QUERYlocal({id:data}).then(
            (doc)=>{
                if(doc){
                    qflows.DELETEquotefolder(doc[0],Tapp.auser).then(
                        (del)=>{
                            quotedb.mart.REMOVEdoc({id:data}).then(
                                (dell)=>{
                                    if(dell){
                                        return resolve({msg:'Quote WAS deleted',status:true});
                                    }else{return resolve({msg:'Quote was NOT deleted',status:false});}
                                }
                            )
                        }
                    );
                }else{return resolve({msg:'Quote was NOT deleted',status:false});}
            }
        )
    })
}

/** Get Quotes based on User
 * 
 *  Provides the clients with the full list of quotes from database
 * 
 * @param {Object} eve 
 * @param {Object} data 
 * @returns 
 */
var GETuserquotes = (eve,data)=>{
    return new Promise((resolve,reject)=>{
        if(Tapp.auser.uname != ''){
            quotedb.mart.QUERYlocal().then(list=>{
                if(list){
                    if(list.length==0){eve.sender.send(qdashroutes.getuserquotes,{msg:String('No Quotes to Load'),quotes:[]});}
                    else{
                        list = qflows.CLEANquotefolders(list,Tapp.auser);
                        for(let x=0;x<list.updates.length;x++){
                            quotedb.mart.UPDATEdoc({id:list.updates[x].id},{$set:list.updates[x]});
                        }
                        return resolve({msg:String('Loaded Quotes'),quotes:list.quotes})
                    }
                }else{return resolve({msg:String('Failed to Access Quotes'),quotes:[]});}
            })
        }else{return resolve({msg:'No user',quotes:[]});}
    })
}

/** Load Quote
 * 
 *  Checks to see if there was a quote id passed. If it is, the
 *  id is passed through.
 * 
 * @todo - Check to make sure the id is a valid id (QUERYdocs)
 * 
 * @param {Object} eve 
 * @param {
 *      id:String -> id of quote to load
 * } data 
 * @returns
 */
var LOADquote = (eve,data)=>{
    let isopen = false;
    if(data.id&&data.id!=undefined){ //check data.id
        //for(let x=0;x<quotev.length;x++){ //see if the id is in the quotev[]
        //  if(quotev[x].id==data.id){
        //    open that BrowserWindow
        //    quotev[x].view.maximize();
        //    isopen = true;
        //    eve.sender.send(qdashroutes.loadquote,{msg:'Quote -'+data.id+'- is open', opennew:false,id:data.id});
        //  }
        //}
        if(!isopen){
            //quotev.push({id:data.id,view:viewtools.loader(controlsroot+'quoter.html',stdwidth,stdheight,false,false,'hidden')});
            return {msg:'Quote -'+data.id+'- was loaded',id:data.id,name:''};
        }
    }else{return {msg:'No quote to open...',id:null};}
}

/** Sync Quotes
 * 
 *  Organizes the syncing of local quotes to the
 *  database.
 * 
 * @param {Object} eve 
 * @param {Object} data 
 * @returns 
 */
var SYNCquotes = (eve,data)=>{
    return new Promise((resolve,reject)=>{
        if(quotedb.ustoresettings.cansync){
            quotedb.mart.SYNCTOmaster().then(({ran,stats})=>{
                quotedb.ustoresettings.needsync=ran;
                console.log('SYNCING TO CALL >',stats);
                return resolve({msg:'Quotes where synced',data:stats});
            });
        }else{return resolve({msg:'',data:null})}
        quotedb.SaveUStoreSettings();
    })
}

/** Create a Contract
 * 
 *  
 * 
 * @param {Object} eve 
 * @param {
 *      contract:Object
 *      quote:Object
 * } data 
 * @returns {msg:String, status:Boolean, quote:Object}
 */
var CREATEcontract = (eve,data)=>{
    return new Promise((resolve,reject)=>{
        if(data.quote!=undefined && data.contract!=undefined){
            qflows.UPDATEcontract(data.contract,data.quote.froot,Tapp.auser).then(
                (stat)=>{
                    if(stat){
                        data.quote.info.contracts[data.contract.system.name]=data.contract;
                        return resolve({msg:'Contract Created',status:true,quote:data.quote});
                    }
                    else{return resolve({msg:'Contract NOT Updated, Close contract file',status:false});}
                }
            );
        }
    })
}

/** Sell a quote
 * 
 *  Takes a quote as 'data' and ochestrates the selling of that quote
 * 
 * @param {Object} eve 
 * @param {Object} data -> quote
 * @returns 
 */
var SELLquote = (eve,data)=>{
    return new Promise((resolve,reject)=>{
        if(data && data!=undefined){
            data.subdate = new Date().toISOString();
            data.sold = true;
            fs.readdir(path.join(Tapp.cuser.spdrive,data.froot,qflows.paths.jobsubfolders.contracts),(err,files)=>{
                if(!err && files.length>0){
                    qflows.MOVEquotefolder(data,Tapp.auser,'S').then(
                        (quote)=>{
                            if(quote){
                                quotedb.mart.UPDATEdoc({id:quote.id},{$set:quote}).then(
                                    (update)=>{
                                        quotedb.mart.QUERYlocal().then(
                                            (list)=>{return resolve({msg:'Update Quotes',quotes:list});}
                                        )
                                    }
                                );
                                return resolve({msg:'Quote HAS been marked sold',status:true});
                            }
                            else{return resolve({msg:'Quote was NOT sold',status:false});}
                        }
                    )
                }else{return resolve({msg:'Quote DOES NOT have a contract',status:false});}
            });
        }else{return resolve({msg:'Quote was NOT sold',status:false});}
    })
}

/* PRESENTATION routes //////////////////////////////////////////////////
*/
var quotepresi = null;

/** Create presentation
 *  
 *  Checks to see if quotepresi is set. If it is, the quote is passed
 *  to the client.
 * 
 * @param {Object} eve 
 * @param {Object} data
 * @returns
 */
var CREATEpresentation = (eve,data)=>{
  console.log(quotepresi);
  let answr = {msg:'',quote:null,user:Tapp.auser};
  if(quotepresi&&quotepresi!=undefined){answr.quote=quotepresi;}
  quotepresi=null;
  return answr;
}
/////////////////////////////////////////////////////////////////////////


let winkey = null;
/*new WindowKey(
    getProductSheets(
        getProductCode('windows'),
        reader.readFile(path.join(__dirname,'Price Books/Price Book.xlsx'))//reader.readFile(tuser.cuser.spdrive + '/Vogel - Bldg Env/Pricing Files/Price Book.xlsx')
    )
);
*/

/**Create a new quote key
 * 
 * Request to build a new price key from the
 * main priceing file. 
 * 
 * @todo clean up window creation
 * 
 * @param {Object} eve 
 * @param {Object} data 
 * @returns {Object}
 */
let CREATEkey = (eve,data)=>{
    if(data == 'REFRESH'){
        delete winkey;
        winkey = new WindowKey(
            getProductSheets(
                getProductCode('windows'),
                reader.readFile(tuser.cuser.spdrive + '/Vogel - Bldg Env/Pricing Files/Price Book.xlsx')
            )
        );
    }
    if(winkey.key){return {success:true,key:winkey.key}}
    else{return {success:false,key:null}}
}

/**Get quote key
 * Returns a copy of the last created key
 * 
 * @param {Object} eve 
 * @param {} data
 * @return {Objec}
 */
let GETkey = (eve,data)=>{
    let answr = {msg:'Key is not Available',key:null}
    if(key&&key!=undefined){answr.msg='Key was updated!';answr.key=quotedb.GetPriceKey(Tapp.cuser,spdrive).key;}
    return answr;
}




module.exports = {
    appproc:{
        'ONclose':ONclose,

        'GOTOlogin':GOTOlogin,
        //GOTOdash,
        //GOTOsettings,
        'GOTOpresentation':GOTOpresentation,
        
        'CREATEquote':CREATEquote,
        'SAVEquote':SAVEquote,
        'DELETEquote':DELETEquote,
        'FINDquote':FINDquote,
        'GETuserquotes':GETuserquotes,
        'LOADquote':LOADquote,
        'SYNCquotes':SYNCquotes,

        'CREATEkey':CREATEkey,
        'GETkey':GETkey,

        'CREATEcontract':CREATEcontract,
        'CREATEpresentation':CREATEpresentation,
        'SELLquote':SELLquote
    }
}