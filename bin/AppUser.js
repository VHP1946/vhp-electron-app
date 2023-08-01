const fs = require('fs');
/**userset.json (local user file)
 * {
 *   "uname": "VOGCH",
 *   "pswrd": "",
 *   "config": {
 *      "group": "DEV"
 *   }
 * }
 * 
 * IMDB folder (C:/IMDB/)needs to be created if AppUser is being
 * used. 
 * 
 */

module.exports = class AppUser {
    /**
     * Takes in a user object AND / OR the userfile
     * and setups a user for the application. The
     * class can be used to modify the user and update
     * the file. It does not handle any other data
     * related to the user.
     * 
     * @param {String} userfile -> user config file location
     * @param {Object} authlist -> dictionary (by uname) of users and info
     */
    constructor({
        users={},
        userfile=''
    }){
        this.userfile = userfile;
        this.userslist = users; //list of user credentials for application **authlist
        this.refreshed = false; //has just changed=(true) other module would acknowledge and turn it (false)
        this.saved = true;
        try{this.creds = require(this.userfile);}
        catch{
            this.creds={
                uname:'',
                pswrd:'',
                config:{}
            }
            this.RWappuser();
        }

        console.log('USER ',this.creds);
        this.uRoutes={
            authUser:(eve,{uname='',pswrd=''})=>{
                return new Promise((resolve,reject)=>{
                    let auth=false;
                    if(this.AUTHappuser(uname,pswrd)){auth=true;}
                    return resolve(auth);//eve.sender.send('authUser',auth);
                });
            },
            getUser:(eve,data)=>{return new Promise((resolve,reject)=>{return resolve(this.creds);});},//eve.sender.send('getUser',this.creds);}
            logOut:(eve,data)=>{return new Promise((resolve,reject)=>{return resolve(this.RESETuser());});}
        }
    }

    /** User Authentication
     * Test whether passed user creds can be
     * matched in this.authlist. If they are
     * the TRUE is return, not then FALSE.
     * 
     * @param {String} uname 
     * @param {String} pswrd 
     * @returns {Boolean}
     */
    AUTHappuser=(uname='',pswrd='')=>{
        if(this.userslist[uname] && this.userslist[uname].pswrd===pswrd){
            this.creds.uname = uname.toUpperCase();
            this.creds.pswrd = pswrd;
            this.creds.config = this.userslist[uname].config||{};
            this.RWappuser();//store to local userset.json
            this.refreshed=true;
            return true;
        }else{return false;}
    }

    /**Read Write appuser
     * Will either read OR write the local appuser
     * 
     * @param {Boolean} read
     * @returns file contents OR Boolean, dependant on write success
     */
    RWappuser=(read=false)=>{
        if(this.userfile){
            if(read){return require(this.userfile)}
            else{
                fs.writeFile(this.userfile,JSON.stringify(this.creds),(err,data)=>{
                    if(!err){this.saved=true;}
                    else{this.saved=false;}
                })
                return this.saved;
            }
        }
    }

    RESETuser=()=>{
        this.creds={
            uname:'',
            pswrd:'',
            config:{}
        }
        this.RWappuser();//reset the saving 
        return this.creds;
    }
}