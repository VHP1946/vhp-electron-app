/* Utility elements that hide off screen */
var vudom = {
  toggler:'vg-utilcont-toggle',
  info:'vg-utilcont-info',
  top:{
    cont:'vg-utilcont-top',
    info:'vg-utilcont-top-info'
  },
  bottom:{
    cont:'vg-utilcont-bottom',
    info:'vg-utilcont-bottom-info'
  },
  right:{
    cont:'vg-utilcont-right',
    info:'vg-utilcont-right-info'
  },
  left:{
    cont:'vg-utilcont-left',
    info:'vg-utilcont-left-info'
  }
}

var mdown = false; //is the mousedown
var mpos = [0,0,'']; //holds [clientX,clientY,'edge name']
/*  Sets the needed side utilty elements

    PASS:
      - top,down,right,left = true or false on whether an edge is needed

    My want to also pass a relative container. These side utilities could
    be oriented inside a parent div???
*/
var SETupdownside = (top,bottom,right,left,touch=false)=>{
  let edge;
  let edges = []; //to track all active edges

  for(let x=1;x<=4;x++){
    let make = true; //whether or not to make the elements
    edge = null;
  //  try{
      switch (x) { //set the edges
        case 1 :
          if(top){
            edge=document.getElementById(vudom.top.cont);
            edges.push('top');
          }else{make=false}
          break;
        case 2 :
          if(bottom){
            edge=document.getElementById(vudom.bottom.cont);
            edges.push('bottom');
          }else{make=false}
          break;
        case 3 :
          if(right){
            edge=document.getElementById(vudom.right.cont);
            edges.push('right');
          }else{make=false}
          break;
        case 4:
          if(left){
            edge=document.getElementById(vudom.left.cont);
            edges.push('left');
          }else{make=false}
        }
  //  }catch{make=false}
    if(make){
      edge.getElementsByClassName(vudom.toggler)[0].addEventListener('click',TOGGLEutil); //set the show hide of utility contents

      edge.addEventListener('mouseleave',(ele)=>{ //hide edge if info is hidden
        if(!$(ele.target.getElementsByClassName(vudom.info)[0]).is(':visible')){
          $(ele.target).hide();
        }
      });
    }
  }
  document.addEventListener('mousemove',(ele)=>{
    var edg = EdgeFinder(edges,ele.clientX,ele.clientY);
    if(edg!=''){$(document.getElementById(vudom[edg].cont))}
  });
  document.addEventListener('mousedown',(ele)=>{
    var edg = EdgeFinder(edges,ele.clientX,ele.clientY);
    mdown = true;
    if(edg!=''){
      mpos[0] = ele.clientX;
      mpos[1] = ele.clientY;
      mpos[2] = edg;
      document.addEventListener('mousemove',DragEdgeOpen);
    }
  });

  if(touch){
    document.addEventListener('touchstart',(ele)=>{
      var edg = EdgeFinder(edges,ele.touches[0].clientX,ele.touches[0].clientY);
      mdown = true;
      if(edg!=''){
        mpos[0] = ele.touches[0].clientX;
        mpos[1] = ele.touches[0].clientY;
        mpos[2] = edg;
        document.addEventListener('touchmove',DragEdgeOpen);
      }
    });
    document.addEventListener('touchend',(ele)=>{
      mpos[0] = 0;
      mpos[1] = 0;
      mpos[2] = '';
      mdown = false;
      document.removeEventListener('touchmove',DragEdgeOpen);
    });
    document.addEventListener('mouseup',(ele)=>{
      mpos[0] = 0;
      mpos[1] = 0;
      mpos[2] = '';
      mdown = false;
      document.removeEventListener('mousemove',DragEdgeOpen);
    });
  }


}

/*  Toggle an utility

    Uses the toggle button passed by event to get to the parentNode
    and the the the lastChild
*/
var TOGGLEutil = (ele)=>{
  let cont = ele.target.parentNode;
  if($(cont.getElementsByClassName(vudom.info)[0]).is(':visible')){
    $(cont).hide();
    $(cont.getElementsByClassName(vudom.info)[0]).hide();
  }else{$(cont.getElementsByClassName(vudom.info)[0]).show();}
}

var EdgeFinder=(edgs,clX,clY)=>{
  for(let x=0;x<edgs.length;x++){
    switch(edgs[x]){
      case 'top':
        if(clY < 30){
          $(document.getElementById(vudom.top.cont)).show();
          return 'top'
        }
        break;
      case 'bottom':
        if(clY>window.innerHeight - 30){
          $(document.getElementById(vudom.bottom.cont)).show();
          return 'bottom'
        }
        break;
      case 'right':
        if(clX>window.innerWidth - 30){
          $(document.getElementById(vudom.right.cont)).show();
          return 'right'
        }
        break;
      case 'left':
        if(clX<30){
          $(document.getElementById(vudom.left.cont)).show();
          return 'left'
        }
    }
  }
  return '';
}

var DragEdgeOpen=(ele)=>{
  var clX = (ele.touches!=undefined) ? ele.touches[0].clientX : ele.clientX;
  var clY = (ele.touches!=undefined) ? ele.touches[0].clientY : ele.clientY;

  var drug = false;
  if(mpos[2] != ''){
    switch(mpos[2]){
      case 'top':
        if(clX > mpos[0]){
          drug = true;
        }
      break;
      case 'bottom':
        if(clX< mpos[0]){
          drug = true;
        }
      break;
      case 'right':
        if(clY < mpos[1]){
          drug = true;
        }
      break;
      case 'left':
        if(clY > mpos[1]){
          drug = true;
        }
    }
    if(drug){
      $(document.getElementById(vudom[mpos[2]].cont)).show();
      $(document.getElementById(vudom[mpos[2]].cont).getElementsByClassName(vudom.info)[0]).show();
      document.removeEventListener('mousemove',DragEdgeOpen);
    }
  }
}

/*  Collaps an edge CONTAINER

    edg - top,bottom,right,left
*/
var CollapseEdge=(edg)=>{
  let cont;
  try{cont = document.getElementById(vudom[edg].cont);}
  catch{return}
  console.log(cont);
  $(cont.children[0]).hide();

}

module.exports = {
  vudom,
  SETupdownside,
  CollapseEdge
}
