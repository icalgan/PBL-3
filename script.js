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
    const scrollDistance = Math.max(hero.offsetHeight - viewportHeight,1);
    const heroRect = hero.getBoundingClientRect();

    // 0 = top of the concert; 1 = end of the sticky scene.
    const progress = clamp(-heroRect.top / scrollDistance,0,1);

    // The first three layers drift gently upward. They remain visible
    // underneath Layer 4 until the incoming purple crowd shape covers them.
    const concertDrift = smoothstep(clamp(progress / 0.85,0,1));
    if(stage){
      stage.style.setProperty('--stage-y',(-concertDrift * viewportHeight * 0.035) + 'px');
    }
    if(idols){
      idols.style.setProperty('--idols-y',(-concertDrift * viewportHeight * 0.065) + 'px');
    }
    if(audience){
      audience.style.setProperty('--audience-y',(-concertDrift * viewportHeight * 0.09) + 'px');
    }

    // Layer 4: crowd silhouette enters from below, then its purple body
    // expands to cover the full viewport. The body colour matches the page.
    const entrance = clamp((progress - 0.025) / 0.82,0,1);
    const easedEntrance = smoothstep(entrance);

    // Keep this in sync with --crowd-band in style.css:
    // clamp(110px, 24.4vw, 460px).
    const crowdBandHeight = clamp(window.innerWidth * 0.244,110,460);

    const finaleY =
      (1 - easedEntrance) * viewportHeight * 1.16
      - easedEntrance * crowdBandHeight;

    if(finale){
      finale.style.setProperty('--finale-y',finaleY + 'px');
    }

    // Fade the scroll hint while the foreground crowd arrives.
    if(cue){
      cue.style.opacity = String(clamp(1 - progress * 2.7,0,1));
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