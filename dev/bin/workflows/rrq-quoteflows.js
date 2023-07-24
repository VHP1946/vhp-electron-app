var fs = require('fs'),
    fsx = require('fs-extra'),
    path = require('path'),
    { exec } = require('child_process');

var contractIO = require('../rrq-contractIO.js');
var wfapppaths = require('../../../app/paths.json');

var toSYNC = [];
var toDELETE = [];

var paths = {
  contracttemp:path.join(wfapppaths.deproot,wfapppaths.jobs.board.root,wfapppaths.jobs.board.folders.contract,wfapppaths.jobs.board.contfile),
  jobfolders:{
    O:path.join(wfapppaths.deproot,wfapppaths.jobs.root,wfapppaths.jobs.folders.O),
    S:path.join(wfapppaths.deproot,wfapppaths.jobs.root,wfapppaths.jobs.folders.S),
    I:path.join(wfapppaths.deproot,wfapppaths.jobs.root,wfapppaths.jobs.folders.I),
    C:path.join(wfapppaths.deproot,wfapppaths.jobs.root,wfapppaths.jobs.folders.C)
  },
  jobsubfolders:{
    contracts:'contracts',
    roadmap:'Roadmap',
    servicetickets:'Service Tickets',
    apics:'After Pictures',
    bpics:'Before Pictures',
    manuals:'Manual J',
    bidForms:'Bid Forms',
    boards:'Board Documents'
  }
}

var INITquotefolder=(quote,auser)=>{
  if(quote!=undefined){
    let fname = path.join(paths.jobfolders.O,quote.name + ' ' + quote.opendate.split('T')[0])+' '+quote.id;
    fs.mkdir(path.join(auser.cuser.spdrive,fname),(err)=>{
      if(err){console.log('File Exist')}
      else{
        for(let sf in paths.jobsubfolders){
          fs.mkdir(path.join(auser.cuser.spdrive,fname,paths.jobsubfolders[sf]),(err)=>{
            if(err){console.log('Contract cannot create')}
          });
        }
      }
    });
    quote.froot = fname;
  }
}

/*  MOVE quote to new folder
    PASS:
    - quote: {quote to move}

    quote is passed and the status of the quote will be changed. The function
    takes the saved quote.froot as reference to the old folder location and
    takes the "new" changed quote.status connected to the quote as reference of where
    to put the quotes folder. Then the quote.froot is changed to the new location
*/
var MOVEquotefolder=(quote,auser,toFolder)=>{
  return new Promise((resolve,reject)=>{
    if(quote!=undefined&&quote.froot!=''){
      let fname = quote.froot.split('\\')[quote.froot.split('\\').length-1];
      let destfolder = path.join(auser.cuser.spdrive,paths.jobfolders[toFolder],fname);
      fsx.copy(path.join(auser.cuser.spdrive,quote.froot),destfolder,(err)=>{
        if(!err){
          //need to close all open files in the folder to be deleted
          //or need to que that directory, and attempt to delete on close
          fs.rm(path.join(auser.cuser.spdrive,quote.froot),{recursive:true,force:true},err=>{
            if(err){
              toDELETE.push(path.join(auser.cuser.spdrive,quote.froot));
              //toSYNC.push(quote.froot);
            }//if err, save to que and try to delete later
            quote.froot = path.join(paths.jobfolders[toFolder],fname);
            quote.status = toFolder;
            return resolve(quote);
          });
        }else{return resolve(false)}
      });
    }else{return resolve(false)}
  });
}

var UPDATEcontract=(contract,froot,auser)=>{
  return new Promise((resolve,reject)=>{
    var contracttemplate = path.join(auser.cuser.spdrive,paths.contracttemp);
    var contractout = path.join(auser.cuser.spdrive,froot,paths.jobsubfolders.contracts,contract.customer.name.split(',')[0]+ '-' + contract.group + '-' + contract.system.name  + '.xlsx');
    contractIO.WRITEexcel(contract,contracttemplate,contractout).then(
      (stat)=>{
        fs.stat(contractout,(err,stats)=>{
          if(err){
            console.log(err)
            return resolve(false);
          }else{
            exec(contractout.replace(/ /g,'^ '));
            return resolve(true);
          }
        });
      }
    ).catch((rej)=>{return resolve(false)})
  });
}

var DELETEquotefolder=(quote,auser)=>{
  return new Promise((resolve,reject)=>{
    if(quote.froot){
      fs.rm(path.join(auser.cuser.spdrive,quote.froot),{recursive:true,force:true},err=>{
        if(err){
          toDELETE.push(path.join(auser.cuser.spdrive,quote.froot));
          console.log('COULD NOT DELTE>',toDELETE)
          return resolve(false);
        }
        return resolve(true);
      });
    }else{return resolve(true);}
  });
}

var CLEANquotefolders=(quotes=[],auser)=>{
  let updates = []
  for(let x=0;x<quotes.length;x++){
    if(quotes[x].froot!=undefined){
      if(fs.existsSync(path.join(auser.cuser.spdrive,quotes[x].froot))){
      }else{
        let fname = quotes[x].froot.split('\\')[quotes[x].froot.split('\\').length-1];
        let found = false;
        let yr = '';
        for(let p in paths.jobfolders){
          if(p == 'C'){yr=' ' + new Date().getFullYear();}else{yr='';}
          console.log(path.join(auser.cuser.spdrive,paths.jobfolders[p]+yr,fname));
          if(fs.existsSync(path.join(auser.cuser.spdrive,paths.jobfolders[p]+yr,fname))){
            found = true;
            quotes[x].froot = path.join(paths.jobfolders[p]+yr,fname);
            quotes[x].status = p;
            break;
          }
        }
        if(found){updates.push(quotes[x])}
      }
    }
  }
  return {
    quotes:quotes,
    updates:updates
  }
}

/* Quote Folder Garbage Collector
    Function is called before close to clean any quote folders that could not be
    deleted. Any paths in the toDELETE[] will attempt to delete. If they fail
    again, they are forgotten about
*/
var GARBAGEquotefolders=()=>{
  return new Promise((resolve,reject)=>{
    console.log(toDELETE)
    let count = 0;
    if(toDELETE.length>0){
      console.log(toDELETE.length)
      for(let x=0;x<toDELETE.length;x++){
        fs.rm(toDELETE[x],{recursive:true,force:true},err=>{
          count++;
          console.log(toDELETE[x],'DELTED')
          if(count==toDELETE.length){return resolve(true)}
        });
      }
    }else{return resolve(true)}
  })
}

module.exports={
    paths,
    toSYNC,
    toDELETE,
    INITquotefolder,
    MOVEquotefolder,
    UPDATEcontract,
    DELETEquotefolder,
    CLEANquotefolders,
    GARBAGEquotefolders
}
