const $ = require('jquery'),
    path = require('path');

var {ipcRenderer}=require('electron');


document.getElementById('testbutton').addEventListener('click',(eve)=>{
        ipcRenderer.invoke('store',{
        store:'quotes',
        pack:{
            method:'QUERY',
            options:{query:{id:'RRQ-1690863608600-BETA'}}
        }
    }).then(result=>{
        console.log(result)
        let doc = result.result[0];

        doc.unit='something';
        ipcRenderer.invoke('store',{
            store:'quotes',
            pack:{
                method:'UPDATE',
                options:{
                    query:{id:doc.id},
                    update:doc
                }
            }
        }).then(answr=>{console.log('Save ',answr)})
    })
})