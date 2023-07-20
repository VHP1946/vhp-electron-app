//Utility function, could be moved
function ExcelDateToJSDate(date, time = false) {
    try{
        if (date == undefined || isNaN(date)){
            return '';
        }
        var newdate = new Date(Math.round((date - 25569)*86400*1000));
        if (time){
            return newdate;
        }else{
            return newdate.toISOString().split('T')[0];
        }
    }catch{
        //Future report flag
        return '';
    }
}

module.exports = {
    ExcelDateToJSDate
}
