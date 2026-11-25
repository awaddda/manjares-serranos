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

    /* El parallax de la portada está en el CSS (animación atada al scroll):
       lo mueve el navegador directo, sin JavaScript, y no se atrasa en Safari */

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
        /* En pantallas táctiles la barra de direcciones de Safari cambia el alto
           al hacer scroll; si recalculamos ahí, las hojas pegan un salto. */
        var touch=window.matchMedia('(pointer: coarse)').matches;
        var lastW=window.innerWidth,baseH=window.innerHeight;
        var placeStacks=function(){
            stacks.forEach(function(s){s.style.top=Math.min(0,baseH-s.offsetHeight)+'px'});
        };
        window.addEventListener('resize',function(){
            if(touch&&window.innerWidth===lastW)return;
            lastW=window.innerWidth;baseH=window.innerHeight;
            placeStacks();
        });
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
