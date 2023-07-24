/* User's quote information
    Information here will be in part related tto - winquote.js -
*/

/*User Quote inoformation
    this information is found in the database
     and describes all the quotes belonging to
     a certain user.

    PROPERTIES: 
     - uname = user name found on the consultants
                computer

     - quotes = [] of all quotes belonging to
                 that user
            * it may be helpful to divide quotes
               into seperate arrays based on their
               status. The CONS would be the level
               of maintenence required to monitor
               these different quotes arrays
*/
var UQuote = (uq)=>{
    if(!uq){
        uq = {};
    }
    return{
        uname: uq.uname || '',
        nxtq: uq.nxtq || 1,
        quotes: uq.quotes || [] //array of quote objects created in winquotes
    }   
}

/* Users Quotes
    class to take in UQuote and 
     handle deal with the data further

    Has functions to display form and
     display users quote information to
     the main page.
*/
class UserQuotes{
    constructor(userq){
        this.uq = UQuote(userq); //user quote information found in database

        //calculate user summary information
        //will deal with summary info later
    }
    
    // Get the next quote number
    nxtQuote(){
        return String('WQ-' + this.uq.uname.substring(0,3).toUpperCase() + this.uq.uname[this.uq.uname.length-1] + this.uq.nxtq++);
    }

    // Filter open quotes from this.uq.quotes
    GetOpenQuotes(){
        var oquotes = [];
        for (let x =0;x<this.uq.quotes.length;x++){
            if(this.uq.quotes[x].status == 'O'){
                oquotes.push(this.uq.quotes[x]);
            }
        }
        return oquotes;
    }
    // Filter sold quotes from this.uq.quotes
    GetSoldQuotes(){
        var squotes = [];
        for (let x=0;x<this.uq.quotes.length;x++){
            if(this.uq.quotes[x].status == 'S'){
                squotes.push(this.uq.quotes[x]);
            }
        }
        return squotes;
    }

    // Filter closed quotes from this.uq.quotes
    GetClosedQuotes(){
        var cquotes = [];
        for (let x=0;x<this.uq.quotes.length;x++){
            if(this.uq.quotes[x].status == 'C'){
                cquotes.push(this.uq.quotes[x]);
            }
        }
        return cquotes;
    }


    // Save/Update a quote in the quote list
    SaveAQuote(squote){
        let su = false;
        if(squote){
            for(let x=0;x<this.uq.quotes.length;x++){
                if(this.uq.quotes[x].id == squote.id){
                    this.uq.quotes[x] = squote;
                    su = true;
                    break;
                }
            }
            if(su){
                console.log('User quote was found and updated...');
            }else{
                console.log('User quote was not found...');
                
            }
        }
        else{
            console.log('No user quote to save...');
        }
        return su;
    }
    // Find Quote
    FindQuote(qid){
        for(let x=0;x<this.uq.quotes.length;x++){
            if(this.uq.quotes[x].id == qid){
                return this.uq.quotes[x];
            }
        }
        return null;
    }
}



module.exports = {
    UQuote,
    UserQuotes
}