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
     10. Course syllabus modal, course list modal, and toast
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
  
  /* Full lesson content for all 12 courses across 6 levels */
  const LESSON_CONTENT = {
    'intro-wp': [
      {title:'وردپرس چیست؟', desc:'آشنایی با مفهوم CMS و تاریخچه وردپرس', duration:15},
      {title:'WordPress.com و WordPress.org', desc:'تفاوت دو پلتفرم و انتخاب مناسب', duration:12},
      {title:'کاربردهای وردپرس', desc:'انواع سایت‌های قابل ساخت با وردپرس', duration:18},
      {title:'انواع سایت‌ها', desc:'وبلاگ، فروشگاهی، شرکتی، خبری و...', duration:15},
      {title:'دامنه چیست؟', desc:'انتخاب نام دامنه مناسب و پسوندها', duration:20},
      {title:'هاست چیست؟', desc:'انواع هاستینگ و ویژگی‌های آن', duration:25},
      {title:'DNS چیست؟', desc:'مفهوم DNS و نحوه کارکرد آن', duration:18},
      {title:'SSL چیست؟', desc:'گواهی امنیتی و اهمیت آن برای سایت', duration:20},
      {title:'هاست لینوکس', desc:'تفاوت هاست لینوکس و ویندوز', duration:15},
      {title:'محیط آزمایشی', desc:'راه‌اندازی لوکال هاست با XAMPP یا LocalWP', duration:30},
      {title:'نصب وردپرس', desc:'مراحل نصب وردپرس روی هاست اصلی', duration:35},
      {title:'ساختار فایل‌ها', desc:'آشنایی با wp-content, wp-admin, wp-includes', duration:25},
      {title:'ساختار دیتابیس', desc:'جدول‌های اصلی وردپرس و کاربرد آن‌ها', duration:30},
      {title:'ورود به مدیریت', desc:'صفحه لاگین و تنظیمات اولیه', duration:12},
      {title:'داشبورد', desc:'مروری بر بخش‌های مختلف پیشخوان', duration:20}
    ],
    'dashboard-wp': [
      {title:'پیشخوان', desc:'نگاه کلی به داشبورد وردپرس', duration:15},
      {title:'به‌روزرسانی‌ها', desc:'مدیریت آپدیت هسته، قالب و افزونه', duration:20},
      {title:'نوشته‌ها', desc:'افزودن، ویرایش و حذف نوشته', duration:25},
      {title:'رسانه', desc:'مدیریت تصاویر، ویدئو و فایل‌ها', duration:20},
      {title:'برگه‌ها', desc:'تفاوت برگه و نوشته', duration:18},
      {title:'دیدگاه‌ها', desc:'مدیریت نظرات کاربران', duration:22},
      {title:'نمایش', desc:'تنظیمات قالب و سفارشی‌سازی', duration:25},
      {title:'افزونه‌ها', desc:'نصب و مدیریت پلاگین‌ها', duration:20},
      {title:'کاربران', desc:'مدیریت کاربران و نقش‌ها', duration:18},
      {title:'ابزارها', desc:'ابزارهای درون‌ریزی و برون‌ریزی', duration:15},
      {title:'تنظیمات', desc:'پیکربندی کلی سایت', duration:25},
      {title:'نوار مدیریت', desc:'کاربرد نوار بالای داشبورد', duration:12},
      {title:'پروفایل', desc:'تنظیمات حساب کاربری', duration:15},
      {title:'نقش‌ها', desc:'سطوح دسترسی Administrator, Editor, Author...', duration:20},
      {title:'تنظیمات عمومی', desc:'عنوان، توضیح، زبان و منطقه زمانی', duration:18},
      {title:'خواندن', desc:'تنظیمات صفحه اصلی و تعداد نوشته‌ها', duration:15},
      {title:'نوشتن', desc:'تنظیمات دسته‌بندی پیش‌فرض', duration:12},
      {title:'گفت‌وگو', desc:'تنظیمات دیدگاه‌ها و نظردهی', duration:18},
      {title:'پیوندهای یکتا', desc:'ساختار URL و سئو', duration:20},
      {title:'حریم خصوصی', desc:'صفحه حریم خصوصی و GDPR', duration:15}
    ],
    'content-mgmt': [
      {title:'نوشته چیست؟', desc:'مفهوم Post در وردپرس', duration:15},
      {title:'ایجاد نوشته', desc:'مراحل نوشتن مطلب جدید', duration:20},
      {title:'Gutenberg', desc:'معرفی ویرایشگر بلوکی', duration:25},
      {title:'پاراگراف', desc:'بلوک متن و تنظیمات آن', duration:12},
      {title:'Heading', desc:'تیترهای H1 تا H6', duration:15},
      {title:'تصویر', desc:'افزودن و تنظیم عکس', duration:18},
      {title:'گالری', desc:'ساخت گالری تصاویر', duration:20},
      {title:'ویدئو', desc:'قرار دادن فیلم', duration:15},
      {title:'صوت', desc:'افزودن فایل صوتی', duration:12},
      {title:'لینک', desc:'ایجاد پیوند داخلی و خارجی', duration:18},
      {title:'دکمه', desc:'ساخت دکمه CTA', duration:15},
      {title:'جدول', desc:'درج جدول داده', duration:20},
      {title:'نقل‌قول', desc:'بلوک Blockquote', duration:12},
      {title:'ستون‌ها', desc:'چیدمان چند ستونه', duration:18},
      {title:'رسانه', desc:'کتابخانه رسانه', duration:15},
      {title:'دسته‌بندی', desc:'ساختار Categories', duration:20},
      {title:'برچسب', desc:'Tags و تفاوت با دسته', duration:15},
      {title:'تصویر شاخص', desc:'Featured Image', duration:12},
      {title:'خلاصه', desc:'excerpt و کاربرد آن', duration:15},
      {title:'نویسنده', desc:'تنظیم نویسنده نوشته', duration:10},
      {title:'انتشار', desc:'Publish و گزینه‌های آن', duration:18},
      {title:'پیش‌نویس', desc:'ذخیره موقت', duration:12},
      {title:'زمان‌بندی', desc:'انتشار خودکار در زمان مشخص', duration:20},
      {title:'بازبینی', desc:'Revisions و بازیابی نسخه‌های قبلی', duration:15}
    ],
    'site-structure': [
      {title:'برگه‌ها', desc:'Pages و کاربردها', duration:18},
      {title:'صفحه اصلی', desc:'تنظیم Homepage', duration:20},
      {title:'صفحه وبلاگ', desc:'تنظیم Posts Page', duration:15},
      {title:'منوها', desc:'ساخت منوی اصلی', duration:25},
      {title:'Header', desc:'تنظیم سربرگ', duration:18},
      {title:'Footer', desc:'تنظیم پاورقی', duration:18},
      {title:'Sidebar', desc:'نوار کناری', duration:15},
      {title:'Widget', desc:'ابزارک‌ها', duration:20},
      {title:'Template', desc:'قالب‌های صفحه', duration:22},
      {title:'Post Type', desc:'انواع پست تایپ', duration:25},
      {title:'Taxonomy', desc:'رده‌بندی‌ها', duration:20},
      {title:'دسته‌بندی‌ها', desc:'مدیریت Categories', duration:18},
      {title:'رسانه‌ها', desc:'Media Library', duration:15},
      {title:'کاربران', desc:'User Management', duration:20},
      {title:'نقش‌ها', desc:'Roles & Capabilities', duration:22},
      {title:'دیدگاه‌ها', desc:'Comments System', duration:18},
      {title:'مدیریت محتوا', desc:'Content Workflow', duration:25},
      {title:'جستجو', desc:'Search Functionality', duration:15},
      {title:'URL', desc:'ساختار آدرس‌ها', duration:18},
      {title:'پیوند داخلی', desc:'Internal Linking Strategy', duration:20}
    ],
    'themes-design': [
      {title:'Theme چیست؟', desc:'مفهوم قالب وردپرس', duration:18},
      {title:'نصب قالب', desc:'روش‌های نصب Theme', duration:20},
      {title:'حذف قالب', desc:'مدیریت قالب‌های قدیمی', duration:12},
      {title:'فعال‌سازی', desc:'Active کردن قالب', duration:10},
      {title:'سفارشی‌سازی', desc:'Customizer Panel', duration:25},
      {title:'Site Editor', desc:'ویرایشگر کامل سایت', duration:30},
      {title:'Block Theme', desc:'قالب‌های بلوکی', duration:22},
      {title:'Classic Theme', desc:'قالب‌های کلاسیک', duration:18},
      {title:'Template', desc:'قالب‌های صفحه', duration:25},
      {title:'Template Part', desc:'بخش‌های قالب', duration:20},
      {title:'Header', desc:'طراحی سربرگ', duration:22},
      {title:'Footer', desc:'طراحی پاورقی', duration:20},
      {title:'Navigation', desc:'منوی ناوبری', duration:18},
      {title:'رنگ‌ها', desc:'پالت رنگی', duration:15},
      {title:'Typography', desc:'تنظیم فونت', duration:20},
      {title:'Layout', desc:'چیدمان صفحه', duration:25},
      {title:'Responsive', desc:'واکنش‌گرا', duration:22},
      {title:'موبایل', desc:'نسخه موبایل', duration:18},
      {title:'دسکتاپ', desc:'نسخه دسکتاپ', duration:15},
      {title:'Child Theme', desc:'قالب فرزند', duration:30}
    ],
    'page-builders': [
      {title:'Page Builder', desc:'معرفی صفحه‌سازها', duration:20},
      {title:'Elementor', desc:'کار با المنتور', duration:35},
      {title:'Gutenberg', desc:'ویرایشگر بلوک', duration:25},
      {title:'Block Editor', desc:'ویرایشگر بلوکی پیشرفته', duration:22},
      {title:'Landing Page', desc:'ساخت صفحه فرود', duration:30},
      {title:'صفحه اصلی', desc:'طراحی Homepage', duration:35},
      {title:'صفحات داخلی', desc:'Inner Pages', duration:25},
      {title:'فرم‌ها', desc:'ساخت فرم تماس', duration:20},
      {title:'Popup', desc:'پنجره بازشو', duration:22},
      {title:'Responsive', desc:'واکنش‌گرایی', duration:25},
      {title:'CSS', desc:'مبانی CSS', duration:30},
      {title:'HTML', desc:'ساختار HTML', duration:25},
      {title:'JavaScript', desc:'جاوااسکریپت مقدماتی', duration:28},
      {title:'طراحی', desc:'اصول Design', duration:22},
      {title:'UX', desc:'تجربه کاربری', duration:25},
      {title:'UI', desc:'رابط کاربری', duration:22},
      {title:'دسترس‌پذیری', desc:'Accessibility', duration:20}
    ],
    'plugins-features': [
      {title:'Plugin چیست؟', desc:'مفهوم افزونه', duration:15},
      {title:'نصب', desc:'روش‌های نصب', duration:18},
      {title:'حذف', desc:'Uninstall صحیح', duration:12},
      {title:'فعال‌سازی', desc:'Activate/Deactivate', duration:10},
      {title:'تنظیمات', desc:'Configuration', duration:20},
      {title:'انتخاب افزونه', desc:'معیارهای انتخاب', duration:22},
      {title:'افزونه‌های ضروری', desc:'Must-have Plugins', duration:25},
      {title:'فرم', desc:'Contact Form 7, WPForms', duration:28},
      {title:'عضویت', desc:'سیستم عضویت', duration:25},
      {title:'ورود کاربران', desc:'Login/Register', duration:20},
      {title:'Backup', desc:'پشتیبان‌گیری', duration:22},
      {title:'Cache', desc:'کش کردن', duration:25},
      {title:'Security', desc:'امنیت', duration:28},
      {title:'SEO', desc:'بهینه‌سازی موتور جستجو', duration:30},
      {title:'Analytics', desc:'تحلیل آمار', duration:22},
      {title:'اتصال سرویس‌ها', desc:'Third-party Integration', duration:25},
      {title:'API', desc:'REST API', duration:28},
      {title:'Webhook', desc:'اتصالات خودکار', duration:20}
    ],
    'woocommerce': [
      {title:'WooCommerce چیست؟', desc:'معرفی ووکامرس', duration:20},
      {title:'نصب', desc:'Installation', duration:18},
      {title:'راه‌اندازی', desc:'Setup Wizard', duration:25},
      {title:'محصول', desc:'Product Basics', duration:22},
      {title:'محصول ساده', desc:'Simple Product', duration:20},
      {title:'محصول متغیر', desc:'Variable Product', duration:30},
      {title:'ویژگی‌ها', desc:'Attributes', duration:22},
      {title:'دسته‌بندی', desc:'Categories', duration:18},
      {title:'موجودی', desc:'Inventory', duration:20},
      {title:'قیمت', desc:'Pricing', duration:18},
      {title:'تخفیف', desc:'Discounts', duration:22},
      {title:'سبد خرید', desc:'Cart', duration:20},
      {title:'Checkout', desc:'تسویه حساب', duration:25},
      {title:'پرداخت', desc:'Payment Gateways', duration:28},
      {title:'حمل‌ونقل', desc:'Shipping', duration:25},
      {title:'مالیات', desc:'Tax', duration:22},
      {title:'سفارش‌ها', desc:'Orders', duration:25},
      {title:'مشتریان', desc:'Customers', duration:20},
      {title:'کوپن', desc:'Coupons', duration:22},
      {title:'گزارش‌ها', desc:'Reports', duration:25},
      {title:'ایمیل‌ها', desc:'Email Notifications', duration:20},
      {title:'مدیریت فروشگاه', desc:'Store Management', duration:28}
    ],
    'seo-wp': [
      {title:'SEO چیست؟', desc:'مفهوم سئو', duration:20},
      {title:'موتورهای جستجو', desc:'Search Engines', duration:18},
      {title:'Google', desc:'الگوریتم گوگل', duration:22},
      {title:'Keyword', desc:'کلمه کلیدی', duration:25},
      {title:'Search Intent', desc:'قصد جستجو', duration:20},
      {title:'عنوان صفحه', desc:'Page Title', duration:18},
      {title:'Meta', desc:'Meta Tags', duration:22},
      {title:'Heading', desc:'ساختار تیترها', duration:20},
      {title:'URL', desc:'سئو URL', duration:18},
      {title:'Internal Linking', desc:'لینک‌سازی داخلی', duration:25},
      {title:'Image SEO', desc:'بهینه‌سازی تصاویر', duration:20},
      {title:'Sitemap', desc:'نقشه سایت', duration:22},
      {title:'Robots.txt', desc:'فایل ربات‌ها', duration:18},
      {title:'Canonical', desc:'تگ کنونیکال', duration:20},
      {title:'Schema', desc:'اسکیما', duration:25},
      {title:'Structured Data', desc:'داده‌های ساختاریافته', duration:22},
      {title:'Search Console', desc:'سرچ کنسول', duration:28},
      {title:'Analytics', desc:'گوگل آنالیتیکس', duration:25},
      {title:'Core Web Vitals', desc:'شاخص‌های حیاتی', duration:30},
      {title:'SEO تکنیکال', desc:'Technical SEO', duration:28},
      {title:'Local SEO', desc:'سئو محلی', duration:22},
      {title:'Content SEO', desc:'سئو محتوا', duration:25}
    ],
    'security-speed': [
      {title:'امنیت وردپرس', desc:'مبانی امنیت', duration:22},
      {title:'حملات رایج', desc:'Common Attacks', duration:25},
      {title:'Brute Force', desc:'حملات بروت فورس', duration:20},
      {title:'Malware', desc:'بدافزارها', duration:22},
      {title:'رمز عبور', desc:'Password Security', duration:18},
      {title:'کاربران', desc:'User Security', duration:20},
      {title:'دسترسی‌ها', desc:'Permissions', duration:22},
      {title:'به‌روزرسانی', desc:'Updates', duration:18},
      {title:'Backup', desc:'پشتیبان‌گیری', duration:25},
      {title:'SSL', desc:'گواهی SSL', duration:20},
      {title:'امنیت هاست', desc:'Host Security', duration:22},
      {title:'دیتابیس', desc:'Database Security', duration:25},
      {title:'افزونه‌ها', desc:'Plugin Security', duration:20},
      {title:'قالب', desc:'Theme Security', duration:18},
      {title:'Recovery', desc:'بازیابی سایت', duration:25},
      {title:'Page Speed', desc:'سرعت صفحه', duration:28},
      {title:'Cache', desc:'کش', duration:22},
      {title:'Browser Cache', desc:'کش مرورگر', duration:20},
      {title:'CDN', desc:'شبکه توزیع', duration:25},
      {title:'Image Optimization', desc:'بهینه‌سازی عکس', duration:22},
      {title:'WebP', desc:'فرمت WebP', duration:18},
      {title:'Lazy Loading', desc:'بارگذاری تنبل', duration:20},
      {title:'Minification', desc:'فشرده‌سازی', duration:22},
      {title:'Database', desc:'بهینه‌سازی دیتابیس', duration:25},
      {title:'Core Web Vitals', desc:'شاخص‌های گوگل', duration:28}
    ],
    'wp-dev': [
      {title:'HTML', desc:'ساختار HTML5', duration:30},
      {title:'CSS', desc:'استایل‌دهی', duration:35},
      {title:'JavaScript', desc:'جاوااسکریپت', duration:40},
      {title:'PHP', desc:'پی‌اچ‌پی مقدماتی', duration:45},
      {title:'MySQL', desc:'پایگاه داده', duration:35},
      {title:'WordPress Core', desc:'هسته وردپرس', duration:30},
      {title:'Loop', desc:'حلقه وردپرس', duration:25},
      {title:'Template Hierarchy', desc:'سلسله مراتب قالب', duration:30},
      {title:'The Loop', desc:'کار با لوپ', duration:25},
      {title:'Functions.php', desc:'فایل توابع', duration:28},
      {title:'Hooks', desc:'قلاب‌ها', duration:30},
      {title:'Actions', desc:'اکشن‌ها', duration:25},
      {title:'Filters', desc:'فیلترها', duration:25},
      {title:'Shortcodes', desc:'کدهای کوتاه', duration:22},
      {title:'CPT', desc:'پست تایپ سفارشی', duration:30},
      {title:'Taxonomies', desc:'رده‌بندی سفارشی', duration:25},
      {title:'Custom Fields', desc:'فیلدهای دلخواه', duration:28},
      {title:'REST API', desc:'API REST', duration:35},
      {title:'AJAX', desc:'درخواست‌های AJAX', duration:30},
      {title:'WP-CLI', desc:'خط فرمان', duration:25},
      {title:'Cron', desc:'وظایف زمان‌بندی', duration:22},
      {title:'Database API', desc:'API دیتابیس', duration:28}
    ],
    'theme-plugin-dev': [
      {title:'ساخت Theme', desc:'شروع توسعه قالب', duration:35},
      {title:'فایل‌های Theme', desc:'ساختار فایل‌ها', duration:30},
      {title:'Template Hierarchy', desc:'سلسله مراتب', duration:35},
      {title:'Header', desc:'header.php', duration:25},
      {title:'Footer', desc:'footer.php', duration:25},
      {title:'Single', desc:'single.php', duration:28},
      {title:'Page', desc:'page.php', duration:25},
      {title:'Archive', desc:'archive.php', duration:30},
      {title:'Search', desc:'search.php', duration:22},
      {title:'404', desc:'404.php', duration:20},
      {title:'Enqueue', desc:'لود فایل‌ها', duration:28},
      {title:'Theme Support', desc:'پشتیبانی قالب', duration:25},
      {title:'Customizer', desc:'سفارشی‌ساز', duration:30},
      {title:'Block Theme', desc:'قالب بلوکی', duration:35},
      {title:'ساخت Plugin', desc:'شروع افزونه', duration:35},
      {title:'Plugin Header', desc:'هدر افزونه', duration:22},
      {title:'Hooks', desc:'قلاب‌ها در افزونه', duration:30},
      {title:'Settings API', desc:'API تنظیمات', duration:35},
      {title:'Admin Page', desc:'صفحه مدیریت', duration:28},
      {title:'Database', desc:'ذخیره‌سازی', duration:30},
      {title:'Custom Tables', desc:'جدول سفارشی', duration:35},
      {title:'REST API', desc:'API در افزونه', duration:32},
      {title:'AJAX', desc:'AJAX در افزونه', duration:30},
      {title:'امنیت Plugin', desc:'امنیت افزونه', duration:28},
      {title:'انتشار', desc:'منتشر کردن', duration:25}
    ]
  };
  
  const COURSES = [
    {id:'intro-wp',title:'آشنایی با وردپرس',level:'l1',
     topics:['web-basics','domain-host','wp-install','dashboard'],
     desc:'شروع از صفر مطلق: وردپرس چیست، دامنه و هاست، DNS، SSL، نصب وردپرس و آشنایی با ساختار فایل و دیتابیس.',
     minutes:420,price:0,sale:false,
     lessons:LESSON_CONTENT['intro-wp'].map(l => l.title)},
    {id:'dashboard-wp',title:'آموزش کامل داشبورد وردپرس',level:'l1',
     topics:['dashboard','content-mgmt','users-roles'],
     desc:'تور کامل پیشخوان: از نوشته‌ها و رسانه تا تنظیمات، کاربران، ابزارها و مدیریت کامل سایت.',
     minutes:480,price:0,sale:false,
     lessons:LESSON_CONTENT['dashboard-wp'].map(l => l.title)},
    {id:'content-mgmt',title:'مدیریت حرفه‌ای محتوا',level:'l2',
     topics:['content-mgmt','gutenberg','media','posts-pages'],
     desc:'تولید و مدیریت محتوای حرفه‌ای: از ساختار نوشته و ویرایشگر بلوکی تا رسانه و بازبینی.',
     minutes:540,price:0,sale:false,
     lessons:LESSON_CONTENT['content-mgmt'].map(l => l.title)},
    {id:'site-structure',title:'مدیریت ساختار سایت',level:'l2',
     topics:['posts-pages','themes','users-roles'],
     desc:'ساخت ساختار حرفه‌ای سایت: برگه، منو، Header/Footer، ویجت، URL و مدیریت جستجو.',
     minutes:480,price:0,sale:false,
     lessons:LESSON_CONTENT['site-structure'].map(l => l.title)},
    {id:'themes-design',title:'قالب‌ها و طراحی وردپرس',level:'l3',
     topics:['themes','site-editor','design'],
     desc:'تسلط بر قالب‌ها: از نصب و سفارشی‌سازی تا Site Editor، Block Theme و Child Theme.',
     minutes:600,price:490,sale:false,
     lessons:LESSON_CONTENT['themes-design'].map(l => l.title)},
    {id:'page-builders',title:'صفحه‌سازها و طراحی پیشرفته',level:'l3',
     topics:['page-builder','design','html-css-js'],
     desc:'طراحی حرفه‌ای با Elementor و Gutenberg: Landing Page، فرم، Popup و مبانی CSS/HTML/JS.',
     minutes:540,price:590,sale:true,
     lessons:LESSON_CONTENT['page-builders'].map(l => l.title)},
    {id:'plugins-features',title:'افزونه‌ها و توسعه امکانات',level:'l4',
     topics:['plugins','security','performance','analytics'],
     desc:'افزودن امکانات حرفه‌ای: انتخاب افزونه، فرم، عضویت، پشتیبان‌گیری، کش، امنیت، سئو و API.',
     minutes:600,price:490,sale:false,
     lessons:LESSON_CONTENT['plugins-features'].map(l => l.title)},
    {id:'woocommerce',title:'راه‌اندازی فروشگاه WooCommerce',level:'l4',
     topics:['woocommerce','shop','plugins'],
     desc:'ساخت فروشگاه کامل: محصول ساده و متغیر، پرداخت، حمل‌ونقل، مالیات، کوپن و گزارش‌ها.',
     minutes:720,price:690,sale:true,
     lessons:LESSON_CONTENT['woocommerce'].map(l => l.title)},
    {id:'seo-wp',title:'سئوی حرفه‌ای وردپرس',level:'l5',
     topics:['seo','analytics','performance'],
     desc:'سئوی درون‌صفحه و تکنیکال: کلمه کلیدی، Meta، Schema، Sitemap و Core Web Vitals.',
     minutes:600,price:590,sale:false,
     lessons:LESSON_CONTENT['seo-wp'].map(l => l.title)},
    {id:'security-speed',title:'امنیت و سرعت وردپرس',level:'l5',
     topics:['security','performance','analytics'],
     desc:'محافظت و بهینه‌سازی: حملات رایج، Backup، SSL، Cache، CDN، WebP و بهینه دیتابیس.',
     minutes:660,price:590,sale:false,
     lessons:LESSON_CONTENT['security-speed'].map(l => l.title)},
    {id:'wp-dev',title:'توسعه وردپرس — مبانی برنامه‌نویسی',level:'l6',
     topics:['html-css-js','php','theme-dev','plugin-api'],
     desc:'پایه‌های برنامه‌نویسی: HTML/CSS/JS، PHP، MySQL و معماری WordPress Core.',
     minutes:720,price:890,sale:false,
     lessons:LESSON_CONTENT['wp-dev'].map(l => l.title)},
    {id:'theme-plugin-dev',title:'ساخت قالب و افزونه حرفه‌ای',level:'l6',
     topics:['theme-dev','plugin-api','php'],
     desc:'ساخت کامل Theme و Plugin: از Template Hierarchy و Enqueue تا Settings API و انتشار.',
     minutes:840,price:990,sale:true,
     lessons:LESSON_CONTENT['theme-plugin-dev'].map(l => l.title)}
  ];

  /* Data lookup helpers. */
  const levelByKey = k => LEVELS.find(l => l.key === k);
  const topicByKey = k => TOPICS.find(t => t.key === k);
  const levelLabel = k => (levelByKey(k) || {}).label || k;
  const levelColor = k => (levelByKey(k) || {}).color || '#888';
  const levelNum   = k => (levelByKey(k) || {}).num || '?';
  const topicLabel = k => (topicByKey(k) || {}).label || k;

  /* ==========================================================================
     4. APPLICATION STATE & PROGRESS SYSTEM
     ========================================================================== */
  const state = {
    q:'', sort:'path', view:'grid',
    levels:new Set(), topics:new Set(),
    freeOnly:false, saleOnly:false, maxDur:100
  };
  const DUR_MIN = 120, DUR_MAX = 2400;
  const durFromSlider = v => Math.round(DUR_MIN * Math.pow(DUR_MAX/DUR_MIN, v/100));
  
  /* Progress System: Track completion of lessons and courses */
  const ProgressSystem = (function(){
    const STORAGE_KEY = 'farghar_wp_academy_progress';
    const BADGES_KEY = 'farghar_wp_academy_badges';
    
    function loadProgress(){
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      } catch(e) { return {}; }
    }
    
    function saveProgress(data){
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e){}
    }
    
    function loadBadges(){
      try {
        return JSON.parse(localStorage.getItem(BADGES_KEY)) || [];
      } catch(e) { return []; }
    }
    
    function saveBadges(data){
      try { localStorage.setItem(BADGES_KEY, JSON.stringify(data)); } catch(e){}
    }
    
    function getCourseProgress(courseId){
      const progress = loadProgress();
      return progress[courseId] || { completedLessons: [], completedAt: null };
    }
    
    function setLessonCompleted(courseId, lessonIndex){
      const progress = loadProgress();
      if (!progress[courseId]) {
        progress[courseId] = { completedLessons: [], completedAt: null };
      }
      if (!progress[courseId].completedLessons.includes(lessonIndex)) {
        progress[courseId].completedLessons.push(lessonIndex);
        progress[courseId].completedLessons.sort((a,b) => a-b);
        
        // Check if course is complete
        const course = COURSES.find(c => c.id === courseId);
        if (course && progress[courseId].completedLessons.length >= course.lessons.length) {
          progress[courseId].completedAt = new Date().toISOString();
        }
        
        saveProgress(progress);
        updateLevelProgress();
        checkLevelBadges();
        return true;
      }
      return false;
    }
    
    function toggleLessonCompleted(courseId, lessonIndex){
      const progress = loadProgress();
      if (!progress[courseId]) {
        progress[courseId] = { completedLessons: [], completedAt: null };
      }
      const idx = progress[courseId].completedLessons.indexOf(lessonIndex);
      if (idx > -1) {
        progress[courseId].completedLessons.splice(idx, 1);
        progress[courseId].completedAt = null;
      } else {
        progress[courseId].completedLessons.push(lessonIndex);
        progress[courseId].completedLessons.sort((a,b) => a-b);
        
        const course = COURSES.find(c => c.id === courseId);
        if (course && progress[courseId].completedLessons.length >= course.lessons.length) {
          progress[courseId].completedAt = new Date().toISOString();
        }
      }
      saveProgress(progress);
      updateLevelProgress();
      checkLevelBadges();
      return !progress[courseId].completedLessons.includes(lessonIndex);
    }
    
    function getCourseCompletionPercentage(courseId){
      const course = COURSES.find(c => c.id === courseId);
      if (!course) return 0;
      const progress = getCourseProgress(courseId);
      return Math.round((progress.completedLessons.length / course.lessons.length) * 100);
    }
    
    function getLevelProgress(levelKey){
      const coursesInLevel = COURSES.filter(c => c.level === levelKey);
      let totalLessons = 0, completedLessons = 0;
      let completedCourses = 0;
      
      coursesInLevel.forEach(course => {
        totalLessons += course.lessons.length;
        const progress = getCourseProgress(course.id);
        completedLessons += progress.completedLessons.length;
        if (progress.completedAt) completedCourses++;
      });
      
      return {
        percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        completedCourses,
        totalCourses: coursesInLevel.length,
        completedLessons,
        totalLessons
      };
    }
    
    function updateLevelProgress(){
      LEVELS.forEach(level => {
        const lp = getLevelProgress(level.key);
        const el = document.getElementById('level-progress-'+level.key);
        if (el) {
          el.style.width = lp.percentage + '%';
          el.setAttribute('aria-valuenow', lp.percentage);
        }
        const pctEl = document.getElementById('level-pct-'+level.key);
        if (pctEl) pctEl.textContent = fa(lp.percentage) + '%';
      });
    }
    
    function isLevelUnlocked(levelIndex){
      if (levelIndex === 0) return true;
      for (let i = 0; i < levelIndex; i++) {
        const level = LEVELS[i];
        const lp = getLevelProgress(level.key);
        if (lp.percentage < 100) return false;
      }
      return true;
    }
    
    function awardBadge(badgeId){
      const badges = loadBadges();
      if (!badges.includes(badgeId)) {
        badges.push(badgeId);
        saveBadges(badges);
        showToast('🏆 نشان جدید کسب شد!', 'success');
        return true;
      }
      return false;
    }
    
    function checkLevelBadges(){
      LEVELS.forEach((level, idx) => {
        const lp = getLevelProgress(level.key);
        if (lp.percentage >= 100) {
          awardBadge('level-'+level.key);
        }
      });
      
      const allProgress = loadProgress();
      const allComplete = COURSES.every(c => {
        const p = allProgress[c.id];
        return p && p.completedAt;
      });
      if (allComplete) {
        awardBadge('master-all');
      }
    }
    
    function hasBadge(badgeId){
      return loadBadges().includes(badgeId);
    }
    
    function resetProgress(){
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BADGES_KEY);
      location.reload();
    }
    
    function getStats(){
      const progress = loadProgress();
      const badges = loadBadges();
      let totalCompleted = 0, totalLessons = 0;
      
      COURSES.forEach(course => {
        totalLessons += course.lessons.length;
        const p = progress[course.id];
        if (p) totalCompleted += p.completedLessons.length;
      });
      
      const completedCourses = COURSES.filter(c => {
        const p = progress[c.id];
        return p && p.completedAt;
      }).length;
      
      return {
        completedLessons: totalCompleted,
        totalLessons,
        completedCourses,
        totalCourses: COURSES.length,
        badgesEarned: badges.length,
        totalBadges: LEVELS.length + 1,
        overallPercentage: Math.round((totalCompleted / totalLessons) * 100)
      };
    }
    
    return {
      getCourseProgress,
      setLessonCompleted,
      toggleLessonCompleted,
      getCourseCompletionPercentage,
      getLevelProgress,
      updateLevelProgress,
      isLevelUnlocked,
      awardBadge,
      hasBadge,
      resetProgress,
      getStats,
      checkLevelBadges
    };
  })();

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
     10. COURSE SYLLABUS MODAL, COURSE LIST MODAL, AND TOAST
     ========================================================================== */
  const modal = $('fargharModal');
  const listModal = $('fargharClockListModal');
  const listModalInner = $('fargharClockListInner');
  const listTrigger = $('fargharClockListTrigger');
  let lastFocused = null;
  let lastListFocused = null;

  /* Build the course list inside the dedicated modal once. */
  function buildCourseList(){
    if (!listModalInner) return;
    listModalInner.innerHTML = COURSES.map((c, i) => {
      const lvl = levelByKey(c.level) || {};
      const color = lvl.color || '#888';
      return '<button type="button" class="farghar-clock-list-item" data-course="'+c.id+'">' +
        '<span class="farghar-clock-list-num" style="background:'+color+'">'+fa(i+1)+'</span>' +
        '<span class="farghar-clock-list-title">'+c.title+'</span>' +
        '<span class="farghar-clock-list-meta">'+fmtDur(c.minutes)+'</span>' +
      '</button>';
    }).join('');
    listModalInner.querySelectorAll('.farghar-clock-list-item').forEach(btn => {
      const course = COURSES.find(c => c.id === btn.dataset.course);
      if (!course) return;
      btn.addEventListener('click', () => {
        closeCourseList();
        openModal(course);
      });
    });
  }
  buildCourseList();

  function openCourseList(){
    if (!listModal) return;
    lastListFocused = document.activeElement;
    listModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const closeBtn = listModal.querySelector('.farghar-modal-close');
      if (closeBtn) closeBtn.focus();
    }, 80);
  }

  function closeCourseList(){
    if (!listModal) return;
    listModal.classList.remove('open');
    /* Only restore body scroll if no other modal is open. */
    if (!modal.classList.contains('open')){
      document.body.style.overflow = '';
    }
    if (lastListFocused && lastListFocused.focus){
      try { lastListFocused.focus(); } catch(_){}
    }
  }

  if (listTrigger){
    listTrigger.addEventListener('click', openCourseList);
  }
  if (listModal){
    listModal.querySelectorAll('[data-close-list]').forEach(el => {
      el.addEventListener('click', closeCourseList);
    });
  }

  function openModal(course){
    lastFocused = document.activeElement;
    const lvl = levelByKey(course.level) || {};
    const icon = $('fargharModalIcon');
    icon.style.background = lvl.color || 'var(--farghar-accent)';
    icon.textContent = lvl.num || '?';
    $('fargharModalTitle').textContent = course.title;
    $('fargharModalMeta').textContent = (lvl.label || '') + ' — ' + fa(course.lessons.length) + ' درس • ' + fmtDur(course.minutes);
    
    // Get progress for this course
    const progress = ProgressSystem.getCourseProgress(course.id);
    const pct = ProgressSystem.getCourseCompletionPercentage(course.id);
    
    $('fargharModalLessons').innerHTML = course.lessons.map((l, i) => {
      const isCompleted = progress.completedLessons.includes(i);
      return '<div class="farghar-lesson'+(isCompleted ? ' completed' : '')+'" data-lesson="'+i+'">' +
        '<button class="farghar-lesson-check" aria-label="تکمیل درس '+fa(i+1)+'" data-course="'+course.id+'" data-index="'+i+'">' +
          (isCompleted ? CHECK_SM : '') +
        '</button>' +
        '<span class="farghar-num" style="background:'+(lvl.color||'var(--farghar-accent)')+'">'+fa(i+1)+'</span>' +
        '<span class="farghar-lesson-title">'+l+'</span>' +
      '</div>';
    }).join('');
    
    // Add click handlers to lesson checkboxes
    $('fargharModalLessons').querySelectorAll('.farghar-lesson-check').forEach(btn => {
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        const courseId = this.dataset.course;
        const lessonIdx = parseInt(this.dataset.index);
        const isNowCompleted = ProgressSystem.toggleLessonCompleted(courseId, lessonIdx);
        
        this.innerHTML = isNowCompleted ? CHECK_SM : '';
        this.closest('.farghar-lesson').classList.toggle('completed', isNowCompleted);
        
        // Update overall progress display
        const newPct = ProgressSystem.getCourseCompletionPercentage(courseId);
        showToast(isNowCompleted ? '✅ درس تکمیل شد!' : '⏸ تکمیل درس لغو شد', isNowCompleted ? 'success' : 'info');
      });
    });
    
    $('fargharModalStart').onclick = () => { 
      closeModal(); 
      if (progress.completedLessons.length > 0) {
        showToast('ادامه دوره «'+course.title+'» — '+fa(pct)+'٪ تکمیل شده', 'success');
      } else {
        showToast('دوره «'+course.title+'» به‌زودی باز می‌شود'); 
      }
    };
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
    /* Only restore body scroll if no other modal is open. */
    if (!listModal.classList.contains('open')){
      document.body.style.overflow = '';
    }
    if (lastFocused && lastFocused.focus) try { lastFocused.focus(); } catch(_){}
  }

  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape'){
      if (listModal.classList.contains('open')){ closeCourseList(); return; }
      closeModal(); openSidebar(false);
    }
    /* Focus trap inside the syllabus modal. */
    if (e.key === 'Tab' && modal.classList.contains('open')){
      const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    /* Focus trap inside the course list modal. */
    if (e.key === 'Tab' && listModal.classList.contains('open')){
      const focusables = listModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });

  let toastTimer;
  function showToast(msg, type='info'){
    const toast = $('fargharToast');
    toast.textContent = msg;
    toast.className = 'show';
    if (type) toast.classList.add('toast-'+type);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show', 'toast-info', 'toast-success', 'toast-warning', 'toast-error');
    }, 2200);
  }

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
        else if (listModal.classList.contains('open')){ e.preventDefault(); closeCourseList(); }
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
     15. INITIALIZATION & PROGRESS TRACKING
     ========================================================================== */
  const durLabel = $('fargharDurLabel');
  if (durLabel) durLabel.textContent = 'همه';
  
  // Initialize progress tracking on load
  ProgressSystem.updateLevelProgress();
  ProgressSystem.checkLevelBadges();
  
  render();

  /* Public API. */
  return {
    version: '4.3.0',
    author: 'Farghar',
    copyright: 'Copyright (c) Farghar - All Rights Reserved.',
    philosophy: 'سرعت حرکت، ارزشمندتر از زمان است.',
    device: FargharDevice,
    data: { LEVELS, TOPICS, COURSES },
    progress: ProgressSystem,
    render, showToast, openModal
  };
})();
