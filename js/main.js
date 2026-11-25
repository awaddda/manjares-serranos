(function(){
    var header=document.getElementById('header');
    var sheet=document.querySelector('.sheet');
    function onScroll(){
        /* En la portada el nav se vuelve negro recién cuando la tarjeta lo alcanza */
        header.classList.toggle('scrolled',sheet?sheet.getBoundingClientRect().top<=header.offsetHeight:window.scrollY>40);
    }
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll);onScroll();

    var toggle=document.getElementById('menuToggle'),nav=document.getElementById('mobileNav');
    function setMenu(open){
        nav.classList.toggle('active',open);
        document.body.classList.toggle('menu-open',open);
        toggle.setAttribute('aria-expanded',String(open));
        toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');
    }
    toggle.addEventListener('click',function(){setMenu(!nav.classList.contains('active'))});
    nav.querySelectorAll('a').forEach(function(l){l.addEventListener('click',function(){setMenu(false)})});
    window.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('active')){setMenu(false);toggle.focus()}});
    window.addEventListener('resize',function(){if(window.innerWidth>=900)setMenu(false)});

    /* Parallax de la foto de portada: sube más lento que la tarjeta */
    var hero=document.querySelector('.hero'),heroImg=hero&&hero.querySelector('.hero-photo img'),heroCopy=hero&&hero.querySelector('.hero-copy');
    if(heroImg&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        var heroSticky=true,heroH=0,heroQueued=false;
        var moveHero=function(){
            heroQueued=false;
            var y=heroSticky?Math.min(window.scrollY,heroH):0;
            heroImg.style.transform='translate3d(0,'+(-y*.3).toFixed(1)+'px,0)';
            /* El texto va más lento que la foto: da sensación de capas */
            if(heroCopy)heroCopy.style.transform='translate3d(0,'+(-y*.15).toFixed(1)+'px,0)';
        };
        var queueHero=function(){
            if(heroQueued)return;
            heroQueued=true;
            requestAnimationFrame(moveHero);
        };
        var measureHero=function(){
            heroSticky=getComputedStyle(hero).position==='sticky';
            heroH=hero.offsetHeight;
            queueHero();
        };
        window.addEventListener('scroll',queueHero,{passive:true});
        window.addEventListener('resize',measureHero);
        measureHero();
    }

    /* Hojas: cada sección se frena cuando su final llega al borde inferior
       de la pantalla, así la siguiente se desliza por encima */
    var stacks=document.querySelectorAll('.stack');
    if(stacks.length){
        /* Tramo de pausa entre hojas: un espacio aparte (no un margen) para que
           la última hoja no empuje a la anterior cuando se acaba la página */
        stacks.forEach(function(s,i){
            if(i===stacks.length-1)return;
            var hold=document.createElement('div');
            hold.className='stack-hold';
            hold.setAttribute('aria-hidden','true');
            s.parentNode.insertBefore(hold,s.nextSibling);
        });
        var placeStacks=function(){
            stacks.forEach(function(s){s.style.top=Math.min(0,window.innerHeight-s.offsetHeight)+'px'});
        };
        window.addEventListener('resize',placeStacks);
        window.addEventListener('load',placeStacks);
        if('ResizeObserver' in window){var ro=new ResizeObserver(placeStacks);stacks.forEach(function(s){ro.observe(s)})}
        placeStacks();
    }

    /* Marca la línea visible en el catálogo */
    var links=document.querySelectorAll('.catalog-nav a');
    if(links.length&&'IntersectionObserver' in window){
        var seen=new IntersectionObserver(function(entries){
            entries.forEach(function(e){
                if(!e.isIntersecting)return;
                links.forEach(function(l){l.classList.toggle('is-current',l.getAttribute('href')==='#'+e.target.id)});
            });
        },{rootMargin:'-35% 0px -60% 0px'});
        links.forEach(function(l){var t=document.querySelector(l.getAttribute('href'));if(t)seen.observe(t)});
    }
})();
