/* Names and methods BEE Quoter LocalStorage

*/

var userls = {
    allusers: 'beeq-allusers',
    curruser: 'beeq-curruser'
}

var quotels = {
    qkey: 'beeq-qpricekey',

    lastquote: 'beeq-lastquote',

    uqlist:'beeq-userquotes',
    curquote:'beeq-currentquot',

    quotetoload: 'beeq-quotetoload',
    reqlastquote: 'beeq-requestlastquote', //TRUE or FALSE
    changedquotes: 'beeq-changedquotes'
}

module.exports = {
    userls,
    quotels
}
