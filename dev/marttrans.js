const {Core}=require('vhp-api');
let API = new Core({
    auth:{
        user:"VOGCH", 
        pswrd:"vogel123"
    },
    host:'http://18.191.223.80/',
    sync:false, 
    dev:{comments:true}
});


let fpack={
    db:'Quotes',
    collect:'Quote350',
    method:'QUERY',
    options:{
        query:{}
    }
}

API.SENDrequest({pack:fpack,route:'STORE',request:'MART'}).then(answr=>{
    console.log(answr);
})