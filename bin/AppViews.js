const path = require('path'),
      fs = require('fs'),
      {BrowserWindow} = require('electron');

/**
 *  AppControls for:
 * - serving application pages
 * - BrowserWindow related task (printing, load, swap)
 * - OS related task (file saving, "Mart" data retrieval)
*/
module.exports = class AppViews{
    /**App Controls
     * Meant to handle all the controlls within
     * a given application.
     * 
     * @param {Number} dwidth -> default window width
     * @param {Number} dheight -> default window height
     * @param {String} controlsroot ->path to controls folder
     * 
     */
    constructor({
        stdwidth=1080,
        stdheight=750,
        root="",
        mainPage="main",
        pages={}
    }){
        this.root = root;
        console.log(pages)
        this.mainPage = mainPage;
        this.pages=pages;

        this.mainv = null; //holds the main BrowserWindow
        this.stdwidth = stdwidth;
        this.stdheight = stdheight;

    }

    /**
     * Loads the 'main' control
     */
    main({dev=false,login=false,appclose=()=>{}}){
        let goto = this.FINDpage(this.mainPage);
        if(goto){
            this.mainv = this.LAUNCHpage({
                path:goto.path,
                options:this.PREPpage(goto.type)
            });
            this.mainv.on('close',appclose)
            return true;
        }else{return false;}
    }

    /**Load Page
     * Accepts a page name and tries to load
     * it.
     * 
     * @todo make react friendly - need to be able to serve react index pages. 
     * First though is ex. 'login/' indicating a react app. Index pages can
     * be folder.
     * 
     * @param {
     *    page:String -> page name to load
     *    view:Boolean -> TRUE opens a new window
     *    options:Object -> properties to modify the window
     * } data
     */
    page=(eve,{ 
        page=null, //
        view=false, //
        options={}
    })=>{
        console.log('Request page -> ',page);
        let goto = this.FINDpage(page);
        console.log(goto);
        let spak = {
            success:false,
            err:null
        }
        if(goto){
            options = this.PREPpage(goto.type);
            let win = this.LAUNCHpage({
                view:view,
                path:goto.path,
                options:options},eve);
            //do something with window
            spak.success=true;
            eve.sender.send('GOTO',spak);
        }else{spak.err='Could Not Find Page';eve.sender.send('GOTO',spak)}
    }

    /**Find a page
     * Takes a request, decides its type, creates a path, and
     * checks if that path exists.
     * 
     * if it does not, false is return. Otherwise an object is
     * returned describing the page
     * 
     * @param {String} request 
     * @returns {
     *  path:String,
     *  type:String
     * }
     */
    FINDpage=(request='')=>{
        let page = {
            path:'',
            type:''
        }
        if(this.pages[request]){
            if(request[request.length-1]==='/'){
                page.path = path.join(this.root,request,'index.html');
                page.type = 'react';
            }//react app
            else{
                page.path = path.join(this.root,request + '.html');
                page.type = 'html';
            }//...html
            if(fs.existsSync(page.path)){return page;}
            else{return false;}
        }else{return false;}
    }
    PREPpage=(type="")=>{
        let options={};
        options.preload=path.join(__dirname,'./reactinjects.js');
        switch(type){
            case 'react':{
                options.titleBarOverlay = {
                    color: '#062a49',
                    symbolColor: '#fff',
                    height: 40
                }
                options.titlebar = 'hidden'
                break;
            }
        }
        return options;
    }
    LAUNCHpage=({view=false,path='',options={}},eve)=>{
        let loader = null;
        if(!view){loader = this.load;}
        else{
            loader=this.swap;
            view=this.mainv
        }
        return loader({
            fpath:path,
            view:view||undefined,
            ...options
        })
    }


    /**
     * 
     * @param {{
     *  fpath:String,
     *  view:BrowserWindow (this.mainv),
     *  w:Number (this.stdwidth),
     *  h:Number (this.stdheight)
     * }} param0 
     */
    swap=({fpath,view,w=this.stdwidth,h=this.stdheight})=>{
        if(view&&view!=undefined){
            console.log(view)
            view.loadURL(fpath);
            if(w!==0){
                view.restore(); 
                view.setSize(w,h);
            }else{view.maximize();}
        }
    }

    /**
     * 
     * @param {{
     *   fpath:String,
     *   view:BrowserWindow (this.mainv),
     *   w:Number (this.stdwidth),
     *   h:Number (this.stdheight)
     *   ONclose:Function (false),
     *   menubar:Boolean (false),
     *   titlebar:String ('show'),
     *   transparent:Boolean (false),
     *   preload:String ('':filepath)
     * }} param0 
     * @returns {BrowserWindow}
     */
    load=({fpath,w=this.stdwidth,h=this.stdheight,ONclose=false,menubar=false,titlebar='show',transparent=false,preload=undefined})=>{
        console.log(preload);
        let nwin = new BrowserWindow({
                webPreferences:{
                    nodeIntegration:true,
                    contextIsolation:false,
                    preload:preload
                },
                width:w<=0?500:w,
                height:h<=0?500:h,
                autoHideMenuBar:menubar,
                titleBarStyle: titlebar,
                transparent:transparent,
            });
            if(w===0){nwin.maximize();}
            nwin.loadURL(fpath);
            if(ONclose){nwin.on('close',ONclose);}
        return nwin;
    }
}
