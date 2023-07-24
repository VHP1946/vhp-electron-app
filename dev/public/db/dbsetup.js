

const DataStore = require('nedb');
const path = require('path');



var LOADdb = (dbpath,id)=>{
    let db = new DataStore(dbpath);
    db.ensureIndex({fieldName: id, unique:true});
    db.loadDatabase();
    return db;
}


module.exports={
    dbtools:{
        LOADdb:LOADdb
    }
}