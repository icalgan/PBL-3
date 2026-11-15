(() => {
  const hero = document.querySelector('.hero-concert');
  if (!hero) return;

  const clamp = (value,min,max) => Math.min(max,Math.max(min,value));
  const smoothstep = value => value * value * (3 - 2 * value);

  const stage = hero.querySelector('.layer-stage');
  const idols = hero.querySelector('.layer-idols');
  const audience = hero.querySelector('.layer-audience');
  const finale = hero.querySelector('.layer-finale');
  const cue = hero.querySelector('.scroll-cue');

  let scheduled = false;

  function updateScene(){
    const viewportHeight = window.innerHeight || 1;
    const viewportWidth = window.innerWidth || 1;
    const scrollDistance = Math.max(hero.offsetHeight - viewportHeight,1);
    const heroRect = hero.getBoundingClientRect();
    const progress = clamp(-heroRect.top / scrollDistance,0,1);

    // The first three layers stay visible underneath Layer 4.
    const drift = smoothstep(clamp(progress / 0.95,0,1));
    if(stage){
      stage.style.setProperty('--stage-y',(-drift * viewportHeight * 0.025) + 'px');
    }
    if(idols){
      idols.style.setProperty('--idols-y',(-drift * viewportHeight * 0.045) + 'px');
    }
    if(audience){
      audience.style.setProperty('--audience-y',(-drift * viewportHeight * 0.065) + 'px');
    }

    // Layer 4 starts just below the audience composition and rises in front.
    // Use the PNG's real dimensions: its opaque purple field begins about
    // 22.36% down the image. Align that boundary with the top of the viewport
    // at the end of the transition, so the purple area fills the screen neatly.
    const entrance = smoothstep(clamp((progress - 0.04) / 0.82,0,1));
    const sourceImageHeight = viewportWidth * 1.09154;
    const solidFieldStart = sourceImageHeight * 0.22364;
    const finaleTopOffset = clamp(viewportHeight * 0.05,20,60);
    const finalCoverOffset = -(solidFieldStart + finaleTopOffset) - 2;

    const startOffset = viewportHeight * 1.12;
    const finaleY = startOffset + (finalCoverOffset - startOffset) * entrance;

    if(finale){
      finale.style.setProperty('--finale-y',finaleY + 'px');
    }

    if(cue){
      cue.style.opacity = String(clamp(1-progress*2.6,0,1));
    }
    scheduled = false;
  }

  function onScroll(){
    if(scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateScene);
  }

  updateScene();
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',updateScene,{passive:true});
  window.addEventListener('load',updateScene,{once:true});
})();
