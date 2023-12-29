const os = require('os'),
      path = require('path'),
      fs = require('fs'),
      reader = require('xlsx'),
      {exec} = require('child_process');



module.exports = class AppFX{
    constructor({
        app='bin'
    }){
        this.computer = {
            uname: os.userInfo().username,
            spdrive: path.join(os.userInfo().homedir, '/vogelheating.com'),
            hdrive: path.join(os.userInfo().homedir),
            cdrive: 'C:/',
            ddrive: path.join(os.userInfo().homedir,'/Desktop')
        }
        this.lsroot = path.join(this.computer.hdrive,'IMDB');//setup local path
        if(!fs.existsSync(this.lsroot)){fs.mkdirSync(this.lsroot);}//setup IMBD folder

        let userfilepath = path.join(this.lsroot,'userconfig.json');
        if(!fs.existsSync(userfilepath)){fs.writeFileSync(userfilepath,'{}')}//setup userconfig file

        this.approot = app?path.join(this.lsroot,app):path.join(this.lsroot,'unkown');//assign app folder path
        if(this.approot){if(!fs.existsSync(this.approot)){fs.mkdirSync(this.approot);}}//setup app folder if needed



        //this.setsfile = path.join(this.root,'storesettings.json');
        this.routes={
            openFolder:this.openFolder,
            printer:this.printer,
            excelTOjson:this.excelTOjson,
            jsonTOexcel:this.jsonTOexcel
        }
    }

    /**Open Folder
     *
     * upon request, will open a folder in the file explorer with a given path,
     * relative to a given drive.
     *
     * Have tested and it works
     *
     * @param {ipcMain Event} eve
     * @param {
     *   drive:String | what drive to root from
     *   path:String | path from the above drive
     * } param1
     */
    openFolder=(eve,{
        drive='',
        fpath=''
    })=>{
      return new Promise((resolve,reject)=>{
          let route = 'openFolder';
          let ofresp = {
            success:false,
            msg:'Could Not Open Folder -> '+fpath
          }
          if(this.computer[drive]){
            fpath = path.join(this.computer[drive],fpath);
            exec(`start "" "${fpath.replace(/\\/g,'\\\\')}"`,(err,stdout,stderr)=>{
                if(err){ofresp.msg=err;}
                else if(stdout){ofresp.success=true;ofresp.msg=stdout;}
                else if(stderr){ofresp.msg=stderr;}
                return resolve(ofresp);//eve.sender.send(route,ofresp);
            });
          }else{return resolve(ofresp);}//eve.sender.send(route,ofresp);}
        });
    }

    /**Printer
    * Upon request, will print the contents of the page
    * requested from
    *
    * HAVE tested a print screen
    * Have not tested saving to specific location
    *
    * @param {ipcMain Event} eve
    * @param {
    *  fpath:String | os.tmpdir(),
    *  fname:String | 'print',
    *  open:Boolean | true
    *
    * } data
    * @returns
    */
    printer=(eve,
      {
        drive =null,
        fpath = os.tmpdir(),
        fname ='print',
        open = true
      }
    )=>{
      return new Promise((resolve,reject)=>{
        let route = 'printer';
        let presp = {
          success:false,
          msg:`Failed to write PDF to ${fpath}`
        };
        if(fpath){
          try{
            let fullpath = path.join(fpath,fname+'.pdf');
            eve.sender.printToPDF({printBackground:true}).then(data => {
              fs.writeFile(fullpath, data, (error) => {
                if (!error){
                  if(open){
                    exec(path.join(fullpath).replace(/ /g,'^ ').replace(/,/g,'^,'),(err,stdout,stderr)=>{
                      if(err){presp.msg=err;}
                      else if(stdout){presp.success=true;presp.msg=stdout;}
                      else if(stderr){presp.msg=stderr;}
                      return resolve(presp);//eve.sender.send(route,presp);
                    });
                  }else{
                    presp.success=true;
                    presp.msg='completed';
                    return resolve(presp);//eve.sender.send(route,presp);
                  }
                }else{
                  presp.msg += `: ${error}`;
                  return resolve(presp);//eve.sender.send(route,presp);
                }
              });
            }).catch(error => {
                presp.msg+=`: ${error}`
                return resolve(presp);//eve.sender.send(route,presp);
            });
        }catch{return resolve(presp);}//eve.sender.send(route,presp)} //File is open, bring file into view
        }else{return resolve(presp);}//eve.sender.send(route,presp)}
      });
    }

    /**  Standard excel sheet to a json filter
    *
    *
    *   @param {ipcMain Event} eve
    *   @param {String} epath
    *   @param {String} jpath
    *   @param {String} SHname
    *   @param {Function} map
    *  *NOTES*
    *  Need to strengthen this function to account for bad
    *  variables. for now there is really no validation.
    */
    excelTOjson=(eve,{
      drive=null,
      epath=null,
      jpath=false,
      SHname='Sheet1',
      map=(m)=>{return m}
    })=>{
      return new Promise((resolve,reject)=>{
        let retpak = {
          success:false,
          msg:'',
          data:null
        }
        try{
          if(this.cumputer[drive]){
            epath= path.join(this.computer[drive],epath);
            let book = reader.readFile(epath);
            let sh = reader.utils.sheet_to_json(book.Sheets[SHname]);
            let jdata = [];
            for (let x=0;x<sh.length;x++){
                jdata.push(map(sh[x]));
            }
            retpak.data = jdata;
            retpak.msg = 'Data was converted';
            retpak.success=true;
            if(jpath){
              jpath = path.join(this.computer[drive],jpath);
              retpak.msg = 'Attempt to write';
              retpak.data = undefined;
              fs.writeFile(jpath,JSON.stringify(jdata),(err)=>{
                  if(err){
                    retpak.success=false;
                    retpak.msg = err;
                  }
                  else{retpak.msg =  `Excel file> ${epath} HAS uploaded to.. /t','JSON file> ${jpath}`}
                  return resolve(retpak);//eve.sender.send('excelTOjson',retpak);
              });
            }
            return resolve(retpak);//eve.sender.send('excelTOjson',retpak);
          }else{retpak.msg = '';return resolve(retpak);}
        }catch{return resolve(retpak);}//eve.sender.send('excelTOjson',retpak);}
      });

    }

    /**
     *
     * @param {*} eve
     * @param {String} epath
     * @param {Object} data
     * @param {Boolean} open
     */
    jsonTOexcel=(eve,{
      drive='',
      epath=null,
      data=[],
      sheetName='MAIN',
      open=false
    })=>{
      return new Promise((resolve,reject)=>{
        let retpak = {
          success:false,
          msg:'could not convert'
        }
        //try{
          if(this.computer[drive]){
            let wb = reader.utils.book_new();


            //for(let i=0;i<data.length;i++){
              reader.utils.book_append_sheet(wb,reader.utils.json_to_sheet(data),sheetName);
            //}
            let epath2 = path.join(this.computer[drive],epath);

            reader.writeFile(wb,path.join(this.computer[drive],epath));
            retpak.msg = 'Check file for further success';
            if(open){
              exec(`start "" "${epath2.replace(/\\/g,'\\\\').replace(/,/g,'^,')}"`,(err,stdout,stderr)=>{
                if(err){retpak.msg=err;}
                else if(stdout){retpak.success=true;retpak.msg=stdout;}
                else if(stderr){retpak.msg=stderr;}
              });
              retpak.msg = 'File is opening';
            }else{return resolve(retpak);}//eve.sender.send('jsonTOexcel',retpak);}
          }else{
            retpak.msg = 'No Drive';
            return resolve(retpak);//eve.sender.send('jsonTOexcel',retpak)}
          }
        //}catch{eve.sender.send('jsonTOexcel',retpak)}
      });

    }
}
