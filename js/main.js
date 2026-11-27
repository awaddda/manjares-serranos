(function(){
    var header=document.getElementById('header');
    var sheet=document.querySelector('.sheet');
    function onScroll(){
        /* En la portada el negro de la tarjeta sube por detrás del nav,
           y el nav queda negro recién cuando la tarjeta lo cubre entero */
        header.classList.toggle('scrolled',sheet?sheet.getBoundingClientRect().top<=0:window.scrollY>40);
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
        var placeStacks=function(){
            stacks.forEach(function(s){s.style.top=Math.min(0,window.innerHeight-s.offsetHeight)+'px'});
        };
        window.addEventListener('resize',placeStacks);
        window.addEventListener('load',placeStacks);
        if('ResizeObserver' in window){var ro=new ResizeObserver(placeStacks);stacks.forEach(function(s){ro.observe(s)})}
        placeStacks();
    }

    /* Detalle de producto: al tocar una tarjeta (salvo Consultar) se abre una ventana */
    var cards=document.querySelectorAll('.product');
    var varieties=document.querySelectorAll('.variety-list li');
    if((cards.length||varieties.length)&&window.HTMLDialogElement){
        var dlg=document.createElement('dialog');
        dlg.className='detail';
        dlg.setAttribute('aria-labelledby','detailName');
        dlg.innerHTML='<div class="detail-box">'+
            '<button type="button" class="detail-close" aria-label="Cerrar detalle"></button>'+
            '<div class="detail-photo"><img alt=""><span class="product-tag" hidden></span></div>'+
            '<div class="detail-text"><h3 class="detail-name" id="detailName"></h3><p class="product-kind"></p>'+
            '<p class="detail-desc"></p><a class="btn btn-gold detail-cta" target="_blank" rel="noopener">Consultar por WhatsApp</a></div>'+
            '</div>';
        document.body.appendChild(dlg);
        var part=function(s){return dlg.querySelector(s)};
        var text=function(root,s){var el=root&&root.querySelector(s);return el?el.textContent.trim():''};
        var lastFocus=null;
        var openDetail=function(d){
            var img=part('.detail-photo img');img.src=d.src;img.alt=d.alt;
            var tag=part('.detail-photo .product-tag');
            tag.className='product-tag'+(d.tagBordo?' product-tag-bordo':'');
            tag.textContent=d.tag;tag.hidden=!d.tag;
            part('.product-kind').textContent=d.kind;
            part('.detail-name').innerHTML=d.name;
            part('.detail-desc').textContent=d.desc;
            part('.detail-cta').href=d.href;
            lastFocus=document.activeElement;
            dlg.showModal();
        };
        cards.forEach(function(card){
            var h=card.querySelector('.product-name'),img=card.querySelector('.product-photo img'),tag=card.querySelector('.product-tag'),link=card.querySelector('.product-link');
            if(!h||!img)return;
            var name=h.innerHTML;
            /* El nombre es el botón que abre el detalle con teclado */
            h.innerHTML='<button type="button" class="product-open" aria-haspopup="dialog">'+name+'</button>';
            card.addEventListener('click',function(e){
                if(e.target.closest('a'))return;
                openDetail({src:img.currentSrc||img.src,alt:img.alt,name:name,kind:text(card,'.product-kind'),desc:text(card,'.product-desc'),
                    href:link?link.href:'#',tag:tag?tag.textContent.trim():'',tagBordo:!!(tag&&tag.classList.contains('product-tag-bordo'))});
            });
        });
        varieties.forEach(function(li){
            var box=li.closest('.variety'),img=li.querySelector('img'),label=li.querySelector('p');
            if(!box||!img)return;
            var h3=box.querySelector('.variety-text h3'),vac=h3&&h3.querySelector('.v');
            var base=h3?h3.firstChild.textContent.trim():'',variant=label?label.textContent.trim():'';
            var descEl=box.querySelector('.variety-text>p:not(.product-kind)'),link=box.querySelector('.variety-text a');
            li.tabIndex=0;
            li.setAttribute('role','button');
            li.setAttribute('aria-haspopup','dialog');
            li.setAttribute('aria-label','Ver detalle de '+base+(variant?', '+variant:''));
            var go=function(){
                openDetail({src:img.currentSrc||img.src,alt:img.alt,name:'<span>'+base+'</span> <span class="t">'+variant+'</span>'+(vac?' <span class="v">'+vac.textContent.trim()+'</span>':''),
                    kind:text(box,'.variety-text .product-kind'),desc:descEl?descEl.textContent.trim():'',href:link?link.href:'#',tag:'',tagBordo:false});
            };
            li.addEventListener('click',go);
            li.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
        });
        part('.detail-close').addEventListener('click',function(){dlg.close()});
        /* Tocar fuera de la ventana también la cierra */
        dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
        dlg.addEventListener('close',function(){if(lastFocus&&lastFocus.focus)lastFocus.focus()});
    }

    /* Nombres sobre la foto: en cada fila, la palabra grande arranca a la misma
       altura. Solo se reserva el lugar que ocupa el nombre más largo de esa fila */
    var names=document.querySelectorAll('.product-photo .product-name');
    if(names.length){
        var alignNames=function(){
            var rows={};
            names.forEach(function(n){
                n.style.minHeight='';
                var card=n.closest('.product'),key=card.parentNode.className+'|'+Math.round(card.getBoundingClientRect().top+window.scrollY);
                (rows[key]=rows[key]||[]).push(n);
            });
            Object.keys(rows).forEach(function(k){
                var row=rows[k],max=0;
                row.forEach(function(n){max=Math.max(max,n.offsetHeight)});
                if(row.length>1)row.forEach(function(n){n.style.minHeight=max+'px'});
            });
        };
        var alignQueued=false;
        var queueAlign=function(){if(alignQueued)return;alignQueued=true;requestAnimationFrame(function(){alignQueued=false;alignNames()})};
        window.addEventListener('resize',queueAlign);
        window.addEventListener('load',queueAlign);
        if(document.fonts&&document.fonts.ready)document.fonts.ready.then(queueAlign);
        alignNames();
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
