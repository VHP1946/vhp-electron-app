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
let pkey = require('./pricekey.json');



let fpack={
    db:'Replacement',
    collect:'Pricing350',
    method:'QUERY',
    options:{
        query:{}
    }
}
let ipack={
    db:'Replacement',
    collect:'Pricing350',
    method:'INSERT',
    options:{docs:pkey}
}
API.SENDrequest({pack:ipack,route:'STORE',request:'MART'}).then(answr=>{
    console.log(answr);
})