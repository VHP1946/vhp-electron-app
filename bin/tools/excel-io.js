var reader = require('xlsx'),
        fs = require('fs'),
    {exec} = require('child_process');




/*  Standard excel sheet to a json filter

    PASS:
     - epath = path to excel file
     - jpath = path to json file
     - SHname = the sheet to get (default Sheet1)
     - map = a ds for mapping (defualt returns the passed
             object as is)

   *NOTES*
   Need to strengthen this function to account for bad
   variables. for now there is really no validation.
*/
var excelTOjson=(epath,jpath=false,SHname='Sheet1',map=(m)=>{return m})=>{
  var book = reader.readFile(epath);
  var sh = reader.utils.sheet_to_json(book.Sheets[SHname]);
  var newsh = [];
  for (let x=0;x<sh.length;x++){
      newsh.push(map(sh[x]));
  }
  if(jpath){
    fs.writeFile(jpath,JSON.stringify(newsh),(err)=>{
        if(err){console.log(err)}
        else{console.log('Excel file> ',epath,' HAS uploaded to.. /t','JSON file> ',jpath)}
    });
  }else{return newsh}
}

var jsonTOexcel = (epath,data,open=false)=>{
  var wb = reader.utils.book_new();

  for(let i=0;i<data.length;i++){
    reader.utils.book_append_sheet(wb,reader.utils.json_to_sheet(data[i].data),data[i].shname);
  }

  reader.writeFile(wb,epath);
  if(open){
    exec(epath.replace(/ /g,'^ '));
  }

}
var jsonTOexcel = (jlist,eshname,efname)=>{
    var wb = reader.utils.book_new();
    reader.utils.book_append_sheet(wb,reader.utils.json_to_sheet(jlist),eshname);
    reader.writeFile(wb,efname);
}


module.exports={
  excelTOjson,
  jsonTOexcel
}
