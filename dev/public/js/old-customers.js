/* Customer File ////////////////////////////////////////////////////////////
    Anything that is/needs to be attached to a customer.

*////////////////////////////////////////////////////////////////////////////

var addrss = (a=null)=>{
    if(!a){
        a = {};
    }
    return{
        street: a.street || '',
        unit: String(a.unit || '') || '',
        city: a.city || '',
        zip: String(a.zip || '') || '',
        state: a.state || ''
    }
}

var cntct = (c=null)=>{
    if(!c){
        c = {};
    }
    return{
        name : c.name || '',
        phone: String(c.phone || '') || '',
        phone2: String(c.phone2 || '') || '',
        email: c.email || '',
        email2: c.email2 || ''
    }
}

var cstmr = (c=null)=>{
    if(!c){
        c={};
    }
    return{
        id: c.id ||'',
        lname:c.lname || '',
        fname:c.fname || '',
        address: addrss(c),
        contact: cntct(c)
    }
}

module.exports={
    cstmr,
    addrss,
    cntct
}
