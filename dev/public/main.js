const $ = require('jquery'),
    path = require('path');

var {ipcRenderer}=require('electron');


let route = 'store';
//RRQ-1689782472381
ipcRenderer.send(route,{
    store:'quotes',
    pack:{
        method:'QUERY',
        options:{query:{id:'RRQ-1689782472381'}}
    },
    options:{
        //refresh:true
    }
});
ipcRenderer.on(route,(eve,data)=>{
    let doc = data.result[0]
    if(data.success){
        console.log(doc);
        doc.cat='test';
    }
})