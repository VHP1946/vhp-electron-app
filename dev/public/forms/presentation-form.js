class Presentation{
  constructor(cont){
    this.cont = cont;
    cont.innerHTML = '';
    cont.appendChild(document.createElement('canvas')).classList.add(this.presdom.notes);
    for(let ea in this.prescontent){
      let section = document.createElement('div');
      section.classList.add(this.presdom.section.cont + ea);
      
      section.appendChild(document.createElement('div')).classList.add(this.presdom.section.header);
      section.lastChild.appendChild(document.createElement('img')).id = ea + '-main-icon';
      section.lastChild.appendChild(document.createElement('div')).innerText = this.prescontent[ea].heading;
      
      section.appendChild(document.createElement('div')).classList.add(this.presdom.section.tiercont + ea);

      for(let i=0;i<4;i++){
        let tiercont = section.lastChild.appendChild(document.createElement('div'));
        tiercont.classList.add(this.presdom.tiercell.cont);
        tiercont.appendChild(document.createElement('div'));
        tiercont.lastChild.classList.add(this.presdom.tiercell.title);
        tiercont.appendChild(document.createElement('div'));
        tiercont.lastChild.classList.add(this.presdom.tiercell.body + ea);
      }
      
      cont.appendChild(section);
    }
  };

  presdom={
    cont:'rrq-presi-cont',
    notes:'rrq-drawing-notes',
    header:'rrq-presi-header',
    footer:'rrq-presi-footer',
    signature:'rrq-drawing-sig',
    icons:{
      experience:'rrq-icon-experience',
      cooling:'rrq-icon-cooling',
      heating:'rrq-icon-heating',
      soundslike:'rrq-icon-soundslike',
      filters:'rrq-icon-filters',
      value:'rrq-icon-value',
      impact:'rrq-icon-impact'
    },
    section:{
      cont:'rrq-section-cont-',
      header:'rrq-section-header',
      tiercont:'rrq-section-tiercont-',
    },
    tiercell:{
      cont:'rrq-tiercell-cont',
      title:'rrq-tiercell-title',
      body:'rrq-tiercell-body-',
    }
  }

  prescontent={
    header:{
        heading:'',
        structure:`
          <span class='rrq-head-value'>
          </span>
        `,
        titles:{
          0:'',
          1:'',
          2:'',
          3:''
        }
    },
    exp:{
        heading:'User Experience',
        structure:`
          <div class="rrq-pres-std-icon">
            <img class="rrq-icon-experience"/>
          </div>
          <div class="rrq-multi-exp-tier-list">
            <ul class='exp-list'>
            </ul>
          </div>
        `,
        content:{
          nostat:``,
          0:
          `<li>Comfort Conceierge Monitors System</li>
          <li>Automatically Monitors and Adjusts System for Optimal Air</li>
          <li>Remote Access from anywhere in the world</li>
          <li>Expandable to Home Automation</li>
          <li>Precise - Accurate - Reliable</li>
          <li>Touch Screen Interface</li>`,
          1:
          `<li>Automatically Monitors and Adjusts System for Optimal Air</li>
          <li>Remote Access from anywhere in the world</li>
          <li>Expandable to Home Automation</li>
          <li>Precise - Accurate - Reliable</li>
          <li>Touch Screen Interface</li>`,
          2:
          `<li>Automatically Monitors and Adjusts System for Optimal Air</li>
          <li>Remote Access from anywhere in the world</li>
          <li>Expandable to Home Automation</li>
          <li>Precise - Accurate - Reliable</li>`,
          3:
          `<li>Remote Access from anywhere in the world</li>
          <li>Accurate - Reliable</li>`
        },
        titles:{
          0:'Ingenious',
          1:'Adaptable',
          2:'Intelligent',
          3:'Reliable'
        }
    },
    comfort:{
        heading:'Home Comfort',
        structure:`
          <div>
            <div>Cooling Feels Like</div>
            <img class="rrq-pres-compare-icon rrq-icon-cooling"/>
          </div>
          <div>
            <div>Heating Feels Like</div>
            <img class="rrq-pres-compare-icon rrq-icon-heating"/>
          </div>
          <div>
            <div>Sounds Like</div>
            <img class="rrq-pres-compare-icon rrq-icon-soundslike"/>
          </div>
          <div>
            <div>Breathe Like</div>
            <img class="rrq-pres-compare-icon rrq-icon-filters"/>
          </div>
        `,
        titles:{
          0:'Pristine',
          1:'Improved',
          2:'Advanced',
          3:'Modern'
        }
    },
    value:{
        heading:'Value',
        structure:`
          <div><span class='rrq-energy'>10</span>% Energy Savings</div>
          <div><span class='rrq-warranty'>10</span> Year Labor Warranty</div>
          <div><span class='rrq-parts'>10</span> Year Parts Warranty</div>
          <div>Max Surge Protection & Safety</div>
          <div>Performance Verification</div>
          <div class='value-icon-box'>
            <div>Lifetime <br>System Savings</div>
            <img class='rrq-icon-value'/>
          </div>
        `,
        titles:null
    },
    headerprint:{
        heading:'',
        structure:`
          <span class='rrq-headerprint-value'>
          </span>
        `,
        titles:null
    },
    impact:{
        heading:'Impact',
        structure:`
          <div>
            <img class="rrq-icon-impact"/>
          </div>
          <div class="rrq-multi-impact">
            <ul>
              <li><span class="highlight-text rrq-impact-carbonreduct">40% Reduction</span> in your homes carbon footprint</li>
              <li><span class="highlight-text rrq-impact-emissions">2 Metric Tons</span> less emmissions from your home annually</li>
              <li>Equal to planting <span class="highlight-text rrq-impact-trees">580 trees</span> in your neighborhood</li>
            </ul>
          </div>
        `,
        titles:{
          0:'Global',
          1:'Green+',
          2:'Green',
          3:'Updated'
        }
    },
    enhance:{
        heading:'Enhancements',
        structure:``,
        titles:null
    },
    adds:{
        heading:'Modifications',
        structure: ``,
        titles:null
    },
    finance:{
        heading:'Investment',
        structure:`
          <div>
            <div class="fin-header">
              <div class="fin-label-uf">Upfront</div>
              <div class="fin-desc-uf">9 mos SAC</div>
            </div>
            <div class="fin-header">
              <div class="fin-label-low">Lowest Payment</div>
              <div class="fin-desc-low">84 mos</div>
            </div>
            <div class="fin-uf-price"></div>
            <div class="fin-low-mo"></div>
          </div>
          <div>
            <div class="fin-header fin-promo-label">Promo - 36 @ 0%</div>
            <div class="fin-promo-price"></div>
            <div class="fin-promo-mo"></div>
          </div>
        `,
        titles:null
    },
    discount:{
        heading:'Rebates & Discounts',
        structure:`
          <div class="rrq-disc-applied"></div>
        `,
        titles:null
    },
    manf:{
        heading:'Manufacturer',
        structure:`
          <img class="rrq-manf-logo">
        `,
        titles:null
    },
    partials:{
        heading:'Partials',
        structure:`
          <div class="rrq-part-header">
            <div></div><div>Cooling</div><div>Heating</div>
          </div>
          <div class="rrq-part-upfront">
            <div><span class="part-desc-uf">9 mos SAC</span>: </div><div></div><div></div>
          </div>
          <div class="rrq-part-lowest">
            <div>Lowest Pymt: </div><div></div><div></div>
          </div>
          <div class="rrq-part-promo">
            <div><span class="part-promo-label">36 Mo. @ 0%</span>: </div><div></div><div></div>
          </div>
          <div class="rrq-part-promomo">
            <div>Promo (mo): </div><div></div><div></div>
          </div>
        `,
        titles:null
    }
  }
}

module.exports={
    Presentation
}