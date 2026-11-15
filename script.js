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

    // Keep the first three concert layers visible while they drift gently upward.
    // They should be covered by the incoming foreground, not disappear beforehand.
    const drift = clamp(progress / 0.95,0,1);
    if(stage) stage.style.setProperty('--stage-y',(-drift * vh * 0.08)+'px');
    if(idols) idols.style.setProperty('--idols-y',(-drift * vh * 0.14)+'px');
    if(audience) audience.style.setProperty('--audience-y',(-drift * vh * 0.20)+'px');

    // Layer 4 enters from below early, with its original PNG proportions.
    // Its transparent top reveals the concert first; the lavender audience
    // silhouette and purple field then sweep upward to cover the scene.
    const enter = clamp((progress - 0.08) / 0.78,0,1);
    const finaleY = (1-enter) * vh * 1.16 - enter * vh * 0.22;
    if(finale) finale.style.setProperty('--finale-y',finaleY+'px');

    if(cue) cue.style.opacity = String(clamp(1-progress*2.5,0,1));
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
