/* ============================================================================
   Farghar WordPress Academy - Application Logic
   Copyright (c) Farghar - All Rights Reserved.
   ----------------------------------------------------------------------------
   Namespace: window.Farghar
   ----------------------------------------------------------------------------
   Table of contents:
     1.  Device detection and adaptation
     2.  Helpers
     3.  Data (levels, topics, courses)
     4.  Application state
     5.  Clock component
     6.  Sidebar filter builders
     7.  Sort dropdown
     8.  Search, view toggle, and checkboxes
     9.  Sidebar open/close
     10. Modal and toast
     11. Sticky market bar and back-to-top button
     12. Filtering, sorting, and rendering
     13. D-pad navigation for KaiOS and Jio Phone 2
     14. Resize handler
     15. Initialization
   ============================================================================ */
window.Farghar = (function(){
  'use strict';

  /* ==========================================================================
     1. DEVICE DETECTION AND ADAPTATION
     ========================================================================== */
  const FargharDevice = (function(){
    const ua = (navigator.userAgent || '').toLowerCase();
    const w = window.innerWidth || 320;
    const h = window.innerHeight || 480;
    const aspect = w / h;
    const isKaiOS = /kaios/i.test(ua);
    const isJio = /jio/i.test(ua);
    const isFeature = (w <= 320);
    const isWatch = (w <= 450 && aspect >= 0.75 && aspect <= 1.35);
    const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = isKaiOS || isJio || isFeature || lowCores || reducedMotion;
    return {
      isKaiOS, isJio, isFeature, isWatch, lowPower, reducedMotion,
      width: w, height: h, aspect,
      label: isWatch ? 'watch' : (isKaiOS || isJio) ? 'kaios' : isFeature ? 'feature' : 'default',
      apply(){
        const cls = ['farghar-device-' + this.label];
        if (this.lowPower) cls.push('farghar-low-power');
        if (this.reducedMotion) cls.push('farghar-reduced-motion');
        if (this.isKaiOS || this.isJio) cls.push('farghar-dpad-mode');
        document.body.classList.add.apply(document.body.classList, cls);
        document.documentElement.setAttribute('data-farghar-device', this.label);
        /* Remove decorative animations on low power devices. */
        if (this.lowPower){
          document.querySelectorAll('.farghar-clock-icon').forEach(el => el.style.animation = 'none');
        }
      }
    };
  })();
  FargharDevice.apply();

  /* ==========================================================================
     2. HELPERS
     ========================================================================== */
  const H = {
    fa(n){ try { return Number(n).toLocaleString('fa-IR'); } catch(_) { return String(n); } },
    fmtDur(m){ if (m < 60) return H.fa(m) + ' دقیقه'; const h = m/60;
      return H.fa(Number.isInteger(h) ? h : h.toFixed(1)) + ' ساعت'; },
    $(id){ return document.getElementById(id); }
  };
  const { fa, fmtDur, $ } = H;

  /* ==========================================================================
     3. DATA (LEVELS, TOPICS, COURSES)
     ========================================================================== */
  const LEVELS = [
    {key:'l1', label:'سطح ۱ — شروع با وردپرس',      short:'آشنایی و کاربری',    color:'#0f8a44', num:'۱'},
    {key:'l2', label:'سطح ۲ — مدیریت حرفه‌ای محتوا', short:'مدیریت محتوا',       color:'#3858e9', num:'۲'},
    {key:'l3', label:'سطح ۳ — طراحی سایت',           short:'طراحی و شخصی‌سازی',  color:'#7c5cff', num:'۳'},
    {key:'l4', label:'سطح ۴ — فروشگاه و امکانات',    short:'فروشگاه و امکانات',  color:'#e07b00', num:'۴'},
    {key:'l5', label:'سطح ۵ — سئو، امنیت و بهینه‌سازی', short:'سئو و امنیت',    color:'#dc2626', num:'۵'},
    {key:'l6', label:'سطح ۶ — توسعه‌دهنده وردپرس',   short:'توسعه و برنامه‌نویسی', color:'#1e293b', num:'۶'}
  ];
  const TOPICS = [
    {key:'web-basics',label:'مبانی وب'},{key:'domain-host',label:'دامنه و هاست'},
    {key:'wp-install',label:'نصب وردپرس'},{key:'dashboard',label:'داشبورد'},
    {key:'content-mgmt',label:'مدیریت محتوا'},{key:'gutenberg',label:'گوتنبرگ'},
    {key:'media',label:'رسانه'},{key:'posts-pages',label:'برگه و نوشته'},
    {key:'users-roles',label:'کاربران'},{key:'themes',label:'قالب‌ها'},
    {key:'site-editor',label:'Site Editor'},{key:'design',label:'طراحی'},
    {key:'page-builder',label:'Page Builder'},{key:'plugins',label:'افزونه‌ها'},
    {key:'woocommerce',label:'WooCommerce'},{key:'shop',label:'فروشگاه'},
    {key:'seo',label:'SEO'},{key:'analytics',label:'Analytics'},
    {key:'security',label:'امنیت'},{key:'performance',label:'Performance'},
    {key:'html-css-js',label:'HTML/CSS/JS'},{key:'php',label:'PHP'},
    {key:'theme-dev',label:'توسعه Theme'},{key:'plugin-api',label:'Plugin/API'}
  ];
  const COURSES = [
    {id:'intro-wp',title:'آشنایی با وردپرس',level:'l1',
     topics:['web-basics','domain-host','wp-install','dashboard'],
     desc:'شروع از صفر مطلق: وردپرس چیست، دامنه و هاست، DNS، SSL، نصب وردپرس و آشنایی با ساختار فایل و دیتابیس.',
     minutes:420,price:0,sale:false,
     lessons:['وردپرس چیست؟','WordPress.com و WordPress.org','کاربردهای وردپرس','انواع سایت‌ها','دامنه چیست؟','هاست چیست؟','DNS چیست؟','SSL چیست؟','هاست لینوکس','محیط آزمایشی','نصب وردپرس','ساختار فایل‌ها','ساختار دیتابیس','ورود به مدیریت','داشبورد']},
    {id:'dashboard-wp',title:'آموزش کامل داشبورد وردپرس',level:'l1',
     topics:['dashboard','content-mgmt','users-roles'],
     desc:'تور کامل پیشخوان: از نوشته‌ها و رسانه تا تنظیمات، کاربران، ابزارها و مدیریت کامل سایت.',
     minutes:480,price:0,sale:false,
     lessons:['پیشخوان','به‌روزرسانی‌ها','نوشته‌ها','رسانه','برگه‌ها','دیدگاه‌ها','نمایش','افزونه‌ها','کاربران','ابزارها','تنظیمات','نوار مدیریت','پروفایل','نقش‌ها','تنظیمات عمومی','خواندن','نوشتن','گفت‌وگو','پیوندهای یکتا','حریم خصوصی']},
    {id:'content-mgmt',title:'مدیریت حرفه‌ای محتوا',level:'l2',
     topics:['content-mgmt','gutenberg','media','posts-pages'],
     desc:'تولید و مدیریت محتوای حرفه‌ای: از ساختار نوشته و ویرایشگر بلوکی تا رسانه و بازبینی.',
     minutes:540,price:0,sale:false,
     lessons:['نوشته چیست؟','ایجاد نوشته','Gutenberg','پاراگراف','Heading','تصویر','گالری','ویدئو','صوت','لینک','دکمه','جدول','نقل‌قول','ستون‌ها','رسانه','دسته‌بندی','برچسب','تصویر شاخص','خلاصه','نویسنده','انتشار','پیش‌نویس','زمان‌بندی','بازبینی']},
    {id:'site-structure',title:'مدیریت ساختار سایت',level:'l2',
     topics:['posts-pages','themes','users-roles'],
     desc:'ساخت ساختار حرفه‌ای سایت: برگه، منو، Header/Footer، ویجت، URL و مدیریت جستجو.',
     minutes:480,price:0,sale:false,
     lessons:['برگه‌ها','صفحه اصلی','صفحه وبلاگ','منوها','Header','Footer','Sidebar','Widget','Template','Post Type','Taxonomy','دسته‌بندی‌ها','رسانه‌ها','کاربران','نقش‌ها','دیدگاه‌ها','مدیریت محتوا','جستجو','URL','پیوند داخلی']},
    {id:'themes-design',title:'قالب‌ها و طراحی وردپرس',level:'l3',
     topics:['themes','site-editor','design'],
     desc:'تسلط بر قالب‌ها: از نصب و سفارشی‌سازی تا Site Editor، Block Theme و Child Theme.',
     minutes:600,price:490,sale:false,
     lessons:['Theme چیست؟','نصب قالب','حذف قالب','فعال‌سازی','سفارشی‌سازی','Site Editor','Block Theme','Classic Theme','Template','Template Part','Header','Footer','Navigation','رنگ‌ها','Typography','Layout','Responsive','موبایل','دسکتاپ','Child Theme']},
    {id:'page-builders',title:'صفحه‌سازها و طراحی پیشرفته',level:'l3',
     topics:['page-builder','design','html-css-js'],
     desc:'طراحی حرفه‌ای با Elementor و Gutenberg: Landing Page، فرم، Popup و مبانی CSS/HTML/JS.',
     minutes:540,price:590,sale:true,
     lessons:['Page Builder','Elementor','Gutenberg','Block Editor','Landing Page','صفحه اصلی','صفحات داخلی','فرم‌ها','Popup','Responsive','CSS','HTML','JavaScript','طراحی','UX','UI','دسترس‌پذیری']},
    {id:'plugins-features',title:'افزونه‌ها و توسعه امکانات',level:'l4',
     topics:['plugins','security','performance','analytics'],
     desc:'افزودن امکانات حرفه‌ای: انتخاب افزونه، فرم، عضویت، پشتیبان‌گیری، کش، امنیت، سئو و API.',
     minutes:600,price:490,sale:false,
     lessons:['Plugin چیست؟','نصب','حذف','فعال‌سازی','تنظیمات','انتخاب افزونه','افزونه‌های ضروری','فرم','عضویت','ورود کاربران','Backup','Cache','Security','SEO','Analytics','اتصال سرویس‌ها','API','Webhook']},
    {id:'woocommerce',title:'راه‌اندازی فروشگاه WooCommerce',level:'l4',
     topics:['woocommerce','shop','plugins'],
     desc:'ساخت فروشگاه کامل: محصول ساده و متغیر، پرداخت، حمل‌ونقل، مالیات، کوپن و گزارش‌ها.',
     minutes:720,price:690,sale:true,
     lessons:['WooCommerce چیست؟','نصب','راه‌اندازی','محصول','محصول ساده','محصول متغیر','ویژگی‌ها','دسته‌بندی','موجودی','قیمت','تخفیف','سبد خرید','Checkout','پرداخت','حمل‌ونقل','مالیات','سفارش‌ها','مشتریان','کوپن','گزارش‌ها','ایمیل‌ها','مدیریت فروشگاه']},
    {id:'seo-wp',title:'سئوی حرفه‌ای وردپرس',level:'l5',
     topics:['seo','analytics','performance'],
     desc:'سئوی درون‌صفحه و تکنیکال: کلمه کلیدی، Meta، Schema، Sitemap و Core Web Vitals.',
     minutes:600,price:590,sale:false,
     lessons:['SEO چیست؟','موتورهای جستجو','Google','Keyword','Search Intent','عنوان صفحه','Meta','Heading','URL','Internal Linking','Image SEO','Sitemap','Robots.txt','Canonical','Schema','Structured Data','Search Console','Analytics','Core Web Vitals','SEO تکنیکال','Local SEO','Content SEO']},
    {id:'security-speed',title:'امنیت و سرعت وردپرس',level:'l5',
     topics:['security','performance','analytics'],
     desc:'محافظت و بهینه‌سازی: حملات رایج، Backup، SSL، Cache، CDN، WebP و بهینه دیتابیس.',
     minutes:660,price:590,sale:false,
     lessons:['امنیت وردپرس','حملات رایج','Brute Force','Malware','رمز عبور','کاربران','دسترسی‌ها','به‌روزرسانی','Backup','SSL','امنیت هاست','دیتابیس','افزونه‌ها','قالب','Recovery','Page Speed','Cache','Browser Cache','CDN','Image Optimization','WebP','Lazy Loading','Minification','Database','Core Web Vitals']},
    {id:'wp-dev',title:'توسعه وردپرس — مبانی برنامه‌نویسی',level:'l6',
     topics:['html-css-js','php','theme-dev','plugin-api'],
     desc:'پایه‌های برنامه‌نویسی: HTML/CSS/JS، PHP، MySQL و معماری WordPress Core.',
     minutes:720,price:890,sale:false,
     lessons:['HTML','CSS','JavaScript','PHP','MySQL','WordPress Core','Loop','Template Hierarchy','The Loop','Functions.php','Hooks','Actions','Filters','Shortcodes','CPT','Taxonomies','Custom Fields','REST API','AJAX','WP-CLI','Cron','Database API']},
    {id:'theme-plugin-dev',title:'ساخت قالب و افزونه حرفه‌ای',level:'l6',
     topics:['theme-dev','plugin-api','php'],
     desc:'ساخت کامل Theme و Plugin: از Template Hierarchy و Enqueue تا Settings API و انتشار.',
     minutes:840,price:990,sale:true,
     lessons:['ساخت Theme','فایل‌های Theme','Template Hierarchy','Header','Footer','Single','Page','Archive','Search','404','Enqueue','Theme Support','Customizer','Block Theme','ساخت Plugin','Plugin Header','Hooks','Settings API','Admin Page','Database','Custom Tables','REST API','AJAX','امنیت Plugin','انتشار']}
  ];

  /* Data lookup helpers. */
  const levelByKey = k => LEVELS.find(l => l.key === k);
  const topicByKey = k => TOPICS.find(t => t.key === k);
  const levelLabel = k => (levelByKey(k) || {}).label || k;
  const levelColor = k => (levelByKey(k) || {}).color || '#888';
  const levelNum   = k => (levelByKey(k) || {}).num || '?';
  const topicLabel = k => (topicByKey(k) || {}).label || k;

  /* ==========================================================================
     4. APPLICATION STATE
     ========================================================================== */
  const state = {
    q:'', sort:'path', view:'grid',
    levels:new Set(), topics:new Set(),
    freeOnly:false, saleOnly:false, maxDur:100
  };
  const DUR_MIN = 120, DUR_MAX = 2400;
  const durFromSlider = v => Math.round(DUR_MIN * Math.pow(DUR_MAX/DUR_MIN, v/100));

  const grid = $('fargharGrid'), shownCount = $('fargharShownCount'), totalPill = $('fargharTotalPill');
  const CHECK_SM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  /* ==========================================================================
     5. CLOCK COMPONENT
     ========================================================================== */
  const clockEl = $('fargharClock');
  const clockHand = $('fargharClockHand');
  const clockCenter = $('fargharClockCenter');
  const clockInfoNum = $('fargharClockInfoNum');
  const clockInfoTitle = $('fargharClockInfoTitle');
  const clockInfoMeta = $('fargharClockInfoMeta');

  function buildClock(){
    const frag = document.createDocumentFragment();
    COURSES.forEach((course, i) => {
      const angle = i * 30;
      const lvl = levelByKey(course.level) || {};
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'farghar-clock-hour';
      btn.style.setProperty('--farghar-clock-angle', angle + 'deg');
      btn.style.setProperty('--farghar-clock-color', lvl.color || '#888');
      btn.setAttribute('data-course', course.id);
      btn.setAttribute('aria-label', 'ساعت ' + (i+1) + ': ' + course.title);
      btn.innerHTML = '<span class="farghar-clock-num">' + fa(i+1) + '</span>' +
                      '<span class="farghar-clock-dot"></span>';
      /* Enable hover interaction only on devices with a fine pointer. */
      /* Bugfix: previous code referenced an undefined `FargharDevice.isKiosk`. */
      const supportsHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (supportsHover && !FargharDevice.isKaiOS && !FargharDevice.isJio){
        btn.addEventListener('mouseenter', () => showClockInfo(course, i));
        btn.addEventListener('mouseleave', hideClockInfo);
      }
      btn.addEventListener('focus', () => showClockInfo(course, i));
      btn.addEventListener('blur', hideClockInfo);
      btn.addEventListener('click', () => openModal(course));
      frag.appendChild(btn);
    });
    clockEl.appendChild(frag);

    /* Mobile and watch: horizontal list. */
    const mobileInner = $('fargharClockMobileListInner');
    if (mobileInner){
      mobileInner.innerHTML = COURSES.map((c, i) => {
        const lvl = levelByKey(c.level) || {};
        return '<button class="farghar-clock-mobile-item" data-course="'+c.id+'">' +
          '<span class="farghar-clock-mobile-num" style="background:'+(lvl.color||'#888')+'">'+fa(i+1)+'</span>' +
          '<span class="farghar-clock-mobile-title">'+c.title+'</span>' +
        '</button>';
      }).join('');
      mobileInner.querySelectorAll('.farghar-clock-mobile-item').forEach(btn => {
        const course = COURSES.find(c => c.id === btn.dataset.course);
        if (course) btn.addEventListener('click', () => openModal(course));
      });
    }

    moveHandTo(0);
  }

  function moveHandTo(hourIdx){
    const rotate = hourIdx * 30;
    clockHand.style.transform = 'translate(-50%,-100%) rotate(' + rotate + 'deg)';
  }

  function showClockInfo(course, hourIdx){
    const lvl = levelByKey(course.level) || {};
    moveHandTo(hourIdx);
    clockInfoNum.textContent = 'ایستگاه ' + fa(hourIdx + 1);
    clockInfoNum.style.color = lvl.color || 'var(--farghar-accent)';
    clockInfoTitle.textContent = course.title;
    clockInfoMeta.textContent = fa(course.lessons.length) + ' درس • ' + fmtDur(course.minutes);
    clockCenter.setAttribute('data-state', 'info');
    clockEl.querySelectorAll('.farghar-clock-hour').forEach(b => b.classList.remove('active'));
    const active = clockEl.querySelector('[data-course="'+course.id+'"]');
    if (active) active.classList.add('active');
  }

  function hideClockInfo(){
    clockCenter.setAttribute('data-state', 'philosophy');
    clockEl.querySelectorAll('.farghar-clock-hour').forEach(b => b.classList.remove('active'));
    moveHandTo(0);
  }

  buildClock();

  /* ==========================================================================
     6. SIDEBAR FILTER BUILDERS
     ========================================================================== */
  function buildFilters(containerId, defs, setKey, showColor){
    const el = $(containerId);
    el.innerHTML = defs.map(d => {
      const dot = showColor
        ? '<span class="farghar-ricon" style="background:'+(d.color||'#ccc')+'"></span>'
        : '';
      return '<button class="farghar-frow" data-key="'+d.key+'">'+
        '<span class="farghar-rtick">'+CHECK_SM+'</span>'+
        dot +
        '<span class="farghar-rlabel">'+d.label+'</span>'+
      '</button>';
    }).join('');
    el.querySelectorAll('.farghar-frow').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.key, set = state[setKey];
        set.has(k) ? set.delete(k) : set.add(k);
        btn.classList.toggle('on', set.has(k));
        render();
      });
    });
  }
  buildFilters('fargharLevelFilters', LEVELS, 'levels', true);
  buildFilters('fargharTopicFilters', TOPICS, 'topics', false);

  /* Collapsible sidebar sections. */
  document.querySelectorAll('.farghar-fsec .farghar-fhead').forEach(head => {
    head.addEventListener('click', () => head.parentElement.classList.toggle('open'));
  });

  /* Promo close button. */
  $('fargharPromoClose').addEventListener('click', () => $('fargharPromo').classList.add('hidden'));

  /* ==========================================================================
     7. SORT DROPDOWN
     ========================================================================== */
  const sortTrigger = $('fargharSortTrigger'), sortMenu = $('fargharSortMenu'), sortLabel = $('fargharSortLabel');
  const sortOptions = Array.from(sortMenu.querySelectorAll('.farghar-sort-option'));
  const isSortOpen = () => sortTrigger.dataset.state === 'open';
  function setSort(open){
    sortTrigger.dataset.state = open ? 'open' : 'closed';
    sortTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    sortMenu.dataset.state = open ? 'open' : 'closed';
  }
  sortTrigger.addEventListener('click', e => { e.stopPropagation(); setSort(!isSortOpen()); });
  sortTrigger.addEventListener('keydown', e => {
    if (['ArrowDown','Enter',' '].includes(e.key)){
      e.preventDefault(); setSort(true);
      (sortOptions.find(o => o.getAttribute('aria-selected') === 'true') || sortOptions[0]).focus();
    } else if (e.key === 'Escape') setSort(false);
  });
  sortOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      state.sort = opt.dataset.value;
      sortLabel.textContent = opt.textContent.trim();
      sortOptions.forEach(o => o.setAttribute('aria-selected', o === opt ? 'true' : 'false'));
      setSort(false); sortTrigger.focus(); render();
    });
    opt.addEventListener('keydown', e => {
      const i = sortOptions.indexOf(opt);
      if (e.key === 'ArrowDown'){ e.preventDefault(); sortOptions[(i+1)%sortOptions.length].focus(); }
      else if (e.key === 'ArrowUp'){ e.preventDefault(); sortOptions[(i-1+sortOptions.length)%sortOptions.length].focus(); }
      else if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); opt.click(); }
      else if (e.key === 'Escape'){ e.preventDefault(); setSort(false); sortTrigger.focus(); }
    });
  });
  document.addEventListener('click', e => {
    if (isSortOpen() && !sortMenu.contains(e.target) && !sortTrigger.contains(e.target)) setSort(false);
  });

  /* ==========================================================================
     8. SEARCH, VIEW TOGGLE, AND CHECKBOXES
     --------------------------------------------------------------------------
     The search field is hidden by default on mobile and watch devices.
     It is toggled by the magnifier button in the market bar and appears
     as a dropdown panel anchored to the market bar.
     ========================================================================== */
  const searchInput = $('fargharSearchInput'), searchWrap = $('fargharSearchWrap');
  const searchToggle = $('fargharSearchToggle');
  const isSearchOpen = () => searchWrap.classList.contains('open');

  /* Check if the current viewport requires the toggle-based search UI. */
  function searchUsesToggle(){
    return window.matchMedia('(max-width: 560px)').matches;
  }

  function setSearchOpen(open){
    /* On desktop the search is always visible; ignore toggle. */
    if (!searchUsesToggle()){
      searchWrap.classList.add('open');
      if (searchToggle){
        searchToggle.setAttribute('aria-expanded', 'true');
      }
      return;
    }
    searchWrap.classList.toggle('open', open);
    if (searchToggle){
      searchToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    if (open){
      /* Focus the input once the panel becomes visible. */
      setTimeout(() => { try { searchInput.focus(); } catch(_){} }, 60);
    }
  }

  /* Search toggle button click. */
  if (searchToggle){
    searchToggle.addEventListener('click', e => {
      e.stopPropagation();
      if (!searchUsesToggle()){
        /* On desktop, focus the input directly. */
        searchInput.focus();
        return;
      }
      setSearchOpen(!isSearchOpen());
    });
  }

  /* Debounced search input. */
  let debounce;
  searchInput.addEventListener('input', e => {
    const v = e.target.value;
    searchWrap.classList.toggle('has-value', v.length > 0);
    clearTimeout(debounce);
    debounce = setTimeout(() => { state.q = v.trim().toLowerCase(); render(); }, 150);
  });

  /* Clear button inside the search field. */
  $('fargharClearSearch').addEventListener('click', e => {
    e.stopPropagation();
    searchInput.value = ''; searchWrap.classList.remove('has-value');
    state.q = ''; render(); searchInput.focus();
  });

  /* Close the search dropdown when clicking outside of it. */
  document.addEventListener('click', e => {
    if (!searchUsesToggle()) return;
    if (!isSearchOpen()) return;
    if (searchWrap.contains(e.target)) return;
    if (searchToggle && searchToggle.contains(e.target)) return;
    setSearchOpen(false);
  });

  /* Close the search dropdown with the Escape key. */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isSearchOpen() && searchUsesToggle()){
      setSearchOpen(false);
      if (searchToggle) searchToggle.focus();
    }
  });

  /* Initialize the search visibility based on viewport. */
  function syncSearchVisibility(){
    if (searchUsesToggle()){
      /* On mobile the field starts closed unless a query is active. */
      if (!state.q){
        searchWrap.classList.remove('open');
        if (searchToggle) searchToggle.setAttribute('aria-expanded', 'false');
      } else {
        searchWrap.classList.add('open');
        if (searchToggle) searchToggle.setAttribute('aria-expanded', 'true');
      }
    } else {
      /* On desktop the field is always visible. */
      searchWrap.classList.add('open');
      if (searchToggle) searchToggle.setAttribute('aria-expanded', 'true');
    }
  }
  syncSearchVisibility();

  /* View toggle. */
  function setView(v){
    state.view = v;
    $('fargharViewGrid').classList.toggle('on', v === 'grid');
    $('fargharViewList').classList.toggle('on', v === 'list');
    $('fargharViewGrid').setAttribute('aria-pressed', v === 'grid');
    $('fargharViewList').setAttribute('aria-pressed', v === 'list');
    grid.classList.toggle('list', v === 'list');
  }
  $('fargharViewGrid').addEventListener('click', () => setView('grid'));
  $('fargharViewList').addEventListener('click', () => setView('list'));

  /* Access checkboxes (free and sale). */
  document.querySelectorAll('.farghar-crow').forEach(row => {
    row.addEventListener('click', () => {
      row.classList.toggle('on');
      const on = row.classList.contains('on');
      if (row.dataset.flag === 'free') state.freeOnly = on;
      if (row.dataset.flag === 'sale') state.saleOnly = on;
      render();
    });
  });

  /* Optional duration slider (may not exist in the current markup). */
  const durRange = $('fargharDurRange');
  if (durRange) durRange.addEventListener('input', e => {
    state.maxDur = +e.target.value;
    const lbl = $('fargharDurLabel');
    if (lbl) lbl.textContent = state.maxDur >= 100 ? 'همه' : 'تا ' + fmtDur(durFromSlider(state.maxDur));
    render();
  });

  /* Reset all filters and search. */
  function resetAll(){
    state.levels.clear(); state.topics.clear();
    state.freeOnly = false; state.saleOnly = false;
    state.maxDur = 100; state.q = '';
    searchInput.value = ''; searchWrap.classList.remove('has-value');
    if (durRange){ durRange.value = 100; $('fargharDurLabel').textContent = 'همه'; }
    document.querySelectorAll('.farghar-frow.on, .farghar-crow.on').forEach(b => b.classList.remove('on'));
    syncSearchVisibility();
    render();
  }
  $('fargharResetAll').addEventListener('click', resetAll);
  $('fargharClearAll').addEventListener('click', resetAll);

  /* ==========================================================================
     9. SIDEBAR OPEN/CLOSE
     ========================================================================== */
  const sidebar = $('fargharSidebar'), scrim = $('fargharScrim');
  function openSidebar(open){
    sidebar.classList.toggle('open', open);
    scrim.classList.toggle('show', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open){
      const first = sidebar.querySelector('button');
      if (first && FargharDevice.lowPower) setTimeout(() => first.focus(), 100);
    }
  }
  $('fargharFilterToggle').addEventListener('click', () => openSidebar(true));
  $('fargharMobileMenu').addEventListener('click', () => openSidebar(true));
  scrim.addEventListener('click', () => openSidebar(false));

  /* ==========================================================================
     10. MODAL AND TOAST
     ========================================================================== */
  const modal = $('fargharModal');
  let lastFocused = null;
  function openModal(course){
    lastFocused = document.activeElement;
    const lvl = levelByKey(course.level) || {};
    const icon = $('fargharModalIcon');
    icon.style.background = lvl.color || 'var(--farghar-accent)';
    icon.textContent = lvl.num || '?';
    $('fargharModalTitle').textContent = course.title;
    $('fargharModalMeta').textContent = (lvl.label || '') + ' — ' + fa(course.lessons.length) + ' درس • ' + fmtDur(course.minutes);
    $('fargharModalLessons').innerHTML = course.lessons.map((l, i) =>
      '<div class="farghar-lesson"><span class="farghar-num" style="background:'+(lvl.color||'var(--farghar-accent)')+'">'+fa(i+1)+'</span><span class="farghar-lesson-title">'+l+'</span></div>'
    ).join('');
    $('fargharModalStart').onclick = () => { closeModal(); showToast('دوره «'+course.title+'» به‌زودی باز می‌شود'); };
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    /* Focus the close button for D-pad navigation. */
    setTimeout(() => {
      const closeBtn = modal.querySelector('.farghar-modal-close');
      if (closeBtn && (FargharDevice.lowPower || !matchMedia('(hover: hover)').matches)) closeBtn.focus();
    }, 80);
  }
  function closeModal(){
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) try { lastFocused.focus(); } catch(_){}
  }
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape'){ closeModal(); openSidebar(false); }
    /* Focus trap inside modal. */
    if (e.key === 'Tab' && modal.classList.contains('open')){
      const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });

  /* ==========================================================================
     11. STICKY MARKET BAR AND BACK-TO-TOP BUTTON
     ========================================================================== */
  const marketBar = $('fargharMarketBar'), backTop = $('fargharBackTop');
  let scrollRAF;
  window.addEventListener('scroll', () => {
    if (scrollRAF) return;
    scrollRAF = requestAnimationFrame(() => {
      marketBar.classList.toggle('stuck', window.scrollY > 4);
      backTop.classList.toggle('show', window.scrollY > 500);
      scrollRAF = null;
    });
  }, { passive:true });
  backTop.addEventListener('click', () => {
    window.scrollTo({ top:0, behavior: FargharDevice.reducedMotion ? 'auto' : 'smooth' });
  });

  /* ==========================================================================
     12. FILTERING, SORTING, AND RENDERING
     ========================================================================== */
  function matches(c){
    if (state.q){
      const hay = [c.title, c.id, c.desc, levelLabel(c.level)]
        .concat(c.lessons, c.topics.map(topicLabel)).join(' ').toLowerCase();
      if (!hay.includes(state.q)) return false;
    }
    if (state.levels.size && !state.levels.has(c.level)) return false;
    if (state.topics.size && !c.topics.some(t => state.topics.has(t))) return false;
    if (state.freeOnly && c.price !== 0) return false;
    if (state.saleOnly && !c.sale) return false;
    if (state.maxDur < 100 && c.minutes > durFromSlider(state.maxDur)) return false;
    return true;
  }
  function sortCourses(arr){
    const s = state.sort;
    return arr.slice().sort((a,b) => {
      if (s === 'path'){
        const la = LEVELS.findIndex(l => l.key === a.level);
        const lb = LEVELS.findIndex(l => l.key === b.level);
        return la - lb || a.title.localeCompare(b.title,'fa');
      }
      if (s === 'duration-asc') return a.minutes - b.minutes;
      if (s === 'name-asc') return a.title.localeCompare(b.title, 'fa');
      return 0;
    });
  }
  function cardHTML(c){
    const isFree = c.price === 0;
    const lvl = levelByKey(c.level) || {};
    const color = lvl.color || '#888';
    const badges =
      (isFree ? '<span class="farghar-badge farghar-badge-free">رایگان</span>' : '') +
      (c.sale ? '<span class="farghar-badge farghar-badge-sale">تخفیف</span>' : '');
    const priceHTML = isFree
      ? '<span class="farghar-price free">رایگان</span>'
      : '<span class="farghar-price">' + fa(c.price) + ' <small>هزار تومان</small></span>';
    const tags = c.topics.slice(0,3).map(t =>
      '<span class="farghar-tag">' + topicLabel(t) + '</span>'
    ).join('') + '<span class="farghar-badge-level" style="background:'+color+'">'+(lvl.num||'')+'</span>';
    const clockIdx = COURSES.indexOf(c) + 1;

    return '<article class="farghar-card" data-id="'+c.id+'" style="--farghar-card-color:'+color+'">'+
      '<div class="farghar-card-top">'+
        '<span class="farghar-pico" style="background:'+color+'">'+fa(clockIdx)+'</span>'+
        '<div class="farghar-card-titlewrap">'+
          '<a class="farghar-card-title" href="#" title="'+c.title+'">'+c.title+'</a>'+
          '<span class="farghar-card-meta">'+fa(c.lessons.length)+' درس • '+fmtDur(c.minutes)+' • '+(lvl.short||'')+'</span>'+
        '</div>'+
        badges+
      '</div>'+
      '<p class="farghar-card-desc">'+c.desc+'</p>'+
      '<div class="farghar-tags">'+tags+'</div>'+
      '<div class="farghar-card-foot">'+
        priceHTML+
        '<div style="display:flex;gap:8px">'+
          '<button class="farghar-btn farghar-btn-primary" data-action="syllabus">سرفصل‌ها</button>'+
          '<button class="farghar-btn farghar-btn-ghost" data-action="start">شروع</button>'+
        '</div>'+
      '</div>'+
    '</article>';
  }
  function render(){
    const list = sortCourses(COURSES.filter(matches));
    shownCount.textContent = fa(list.length);
    totalPill.textContent = fa(list.length);
    const anyFilter = state.levels.size || state.topics.size || state.freeOnly || state.saleOnly || state.maxDur < 100 || state.q;
    $('fargharClearAll').style.display = anyFilter ? 'block' : 'none';
    if (!list.length){
      grid.innerHTML = '<div class="farghar-empty">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M21 21l-6-6"/></svg>' +
        '<p>دوره‌ای با این فیلترها پیدا نشد</p></div>';
      return;
    }
    grid.innerHTML = list.map(cardHTML).join('');
    grid.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const card = btn.closest('.farghar-card');
        const course = COURSES.find(c => c.id === card.dataset.id);
        if (!course) return;
        if (btn.dataset.action === 'syllabus') openModal(course);
        else showToast('دوره «'+course.title+'» به‌زودی باز می‌شود');
      });
    });
    grid.querySelectorAll('.farghar-card-title').forEach(a =>
      a.addEventListener('click', e => e.preventDefault()));
  }
  let toastTimer;
  function showToast(msg){
    const toast = $('fargharToast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ==========================================================================
     13. D-PAD NAVIGATION FOR KAIOS AND JIO PHONE 2
     --------------------------------------------------------------------------
     Users on these devices navigate focusable elements with arrow keys.
     KaiOS browsers support arrow keys, but focus management is our task.
     ========================================================================== */
  (function setupDpad(){
    if (!FargharDevice.isKaiOS && !FargharDevice.isJio && !FargharDevice.isFeature) return;

    const FOCUSABLE_SELECTOR = [
      'button:not([disabled]):not([tabindex="-1"])',
      'a[href]:not([tabindex="-1"])',
      'input:not([disabled]):not([type="hidden"])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    function getFocusable(){
      const nodes = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR));
      return nodes.filter(el => {
        if (el.offsetParent === null && el !== document.activeElement) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
    }

    function moveFocus(direction){
      const items = getFocusable();
      if (!items.length) return;
      const current = document.activeElement;
      let idx = items.indexOf(current);
      if (idx === -1) idx = 0;
      let next = idx + direction;
      if (next < 0) next = items.length - 1;
      if (next >= items.length) next = 0;
      const target = items[next];
      try { target.focus({ preventScroll:false }); } catch(_){ target.focus(); }
      if (target.scrollIntoView) target.scrollIntoView({ block:'nearest', inline:'nearest' });
    }

    document.addEventListener('keydown', e => {
      /* Ignore arrow keys unless focus is inside an input. */
      const tag = (document.activeElement || {}).tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA';
      if (inInput && !['Escape','ArrowUp','ArrowDown'].includes(e.key)) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight'){
        if (inInput && e.key === 'ArrowRight') return; /* Allow input caret movement. */
        e.preventDefault();
        moveFocus(1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft'){
        if (inInput && e.key === 'ArrowLeft') return;
        e.preventDefault();
        moveFocus(-1);
      } else if (e.key === 'Backspace'){
        /* Backspace on KaiOS acts as back. */
        if (modal.classList.contains('open')){ e.preventDefault(); closeModal(); }
        else if (sidebar.classList.contains('open')){ e.preventDefault(); openSidebar(false); }
        else if (isSearchOpen() && searchUsesToggle()){ e.preventDefault(); setSearchOpen(false); }
      }
    });
  })();

  /* ==========================================================================
     14. RESIZE HANDLER
     ========================================================================== */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = window.innerWidth, h = window.innerHeight;
      const aspect = w / h;
      const isWatch = (w <= 450 && aspect >= 0.75 && aspect <= 1.35);
      const isFeature = w <= 320;
      document.body.classList.toggle('farghar-device-watch', isWatch);
      document.body.classList.toggle('farghar-device-feature', isFeature);
      document.documentElement.setAttribute('data-farghar-device',
        isWatch ? 'watch' : isFeature ? 'feature' : FargharDevice.label);
      /* Sync the search visibility when the viewport crosses the breakpoint. */
      syncSearchVisibility();
    }, 250);
  });

  /* ==========================================================================
     15. INITIALIZATION
     ========================================================================== */
  const durLabel = $('fargharDurLabel');
  if (durLabel) durLabel.textContent = 'همه';
  render();

  /* Public API. */
  return {
    version: '4.1.0',
    author: 'Farghar',
    copyright: 'Copyright (c) Farghar - All Rights Reserved.',
    philosophy: 'سرعت حرکت، ارزشمندتر از زمان است.',
    device: FargharDevice,
    data: { LEVELS, TOPICS, COURSES },
    render, showToast, openModal
  };
})();
