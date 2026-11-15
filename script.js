(() => {
  const hero = document.querySelector('.hero-concert');
  if (!hero) return;

  const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
  const stage = hero.querySelector('.layer-stage');
  const idols = hero.querySelector('.layer-idols');
  const audience = hero.querySelector('.layer-audience');
  const finale = hero.querySelector('.layer-finale');
  const cue = hero.querySelector('.scroll-cue');
  let scheduled = false;

  function update(){
    const vh = window.innerHeight || 1;
    const scrollRange = Math.max(hero.offsetHeight - vh,1);
    const rect = hero.getBoundingClientRect();
    const progress = clamp(-rect.top / scrollRange,0,1);

    // Layers 1–3 leave upward at staggered speeds.
    const exit = clamp(progress / 0.68,0,1);
    if(stage) stage.style.setProperty('--stage-y',(-exit * vh * 1.12)+'px');
    if(idols) idols.style.setProperty('--idols-y',(-exit * vh * 1.22)+'px');
    if(audience) audience.style.setProperty('--audience-y',(-exit * vh * 1.34)+'px');

    // Layer 4 rises from below, covers the concert, then moves away
    // to reveal the solid lavender purple base.
    const enter = clamp((progress - 0.30) / 0.34,0,1);
    const leave = clamp((progress - 0.76) / 0.22,0,1);
    const finaleY = ((1-enter) * vh * 1.12) - (leave * vh * 1.20);
    if(finale) finale.style.setProperty('--finale-y',finaleY+'px');

    if(cue) cue.style.opacity = String(clamp(1-progress*3,0,1));
    scheduled = false;
  }

  function onScroll(){
    if(scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }

  update();
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',update,{passive:true});
  window.addEventListener('load',update,{once:true});
})();
