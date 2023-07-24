

var notedom = {
  conts:{ //list of note containers around screen
    tr:'vg-toast-tr', //TopRight
    tl:'vg-toast-tl', //TopLeft
    br:'vg-toast-br', //BottomRight
    bl:'vg-toast-bl' //BottomLeft
  },
  list:{
    cont:'vg-note-list',
    levels:{
      red:'vg-toast-red',
      yellow:'vg-toast-yellow',
      green:'vg-toast-green'
    }
  }
}

/* PLACE A NOTE IN NOTIFIER

   cont = tr,tl,br,bl
*/
var DropNote = (cont,message='',level='green')=>{
  console.log(notedom.conts[cont])
  let ncont;
  let nlist;
  try{ncont = document.getElementById(notedom.conts[cont]);}
  catch{console.log('NOTIFIER -',cont,'not setup');return}
  try{nlist = ncont.getElementsByClassName(notedom.list.cont)[0];}
  catch{console.log('NOTIFIER not setup');return}

  let note = document.createElement('div');
  note.classList.add(notedom.list.levels[level] || '');
  note.innerText = message;

  nlist.appendChild(note);

  setTimeout(()=>{
    nlist.removeChild(note);
  },2000);
}

module.exports={
  DropNote
}
