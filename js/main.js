(function(){
    var header=document.getElementById('header');
    function onScroll(){header.classList.toggle('scrolled',window.scrollY>60)}
    window.addEventListener('scroll',onScroll,{passive:true});onScroll();

    var toggle=document.getElementById('menuToggle'),nav=document.getElementById('mobileNav'),overlay=document.getElementById('navOverlay');
    function toggleMenu(force){var open=force!==undefined?force:!nav.classList.contains('active');nav.classList.toggle('active',open);overlay.classList.toggle('active',open);toggle.classList.toggle('active',open);toggle.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':''}
    toggle.addEventListener('click',function(){toggleMenu()});
    overlay.addEventListener('click',function(){toggleMenu(false)});
    document.querySelectorAll('.mobile-nav-link').forEach(function(l){l.addEventListener('click',function(){toggleMenu(false)})});
    window.addEventListener('keydown',function(e){if(e.key==='Escape')toggleMenu(false)});

    var reveals=document.querySelectorAll('.reveal');
    if('IntersectionObserver' in window){
        var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
        reveals.forEach(function(r){obs.observe(r)});
    } else { reveals.forEach(function(r){r.classList.add('visible')}); }
})();
