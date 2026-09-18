# Farghar WordPress Academy

[![Deploy to GitHub Pages](https://github.com/USERNAME/REPO/actions/workflows/deploy.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/pages-live-3858e9?style=flat-square)](https://USERNAME.github.io/REPO/)
[![License](https://img.shields.io/badge/license-Farghar%20Proprietary-blue?style=flat-square)](./LICENSE)
[![HTML5](https://img.shields.io/badge/HTML-5-e34f26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS-3-1572b6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-f7df1e?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)

> **مسیر ۰ تا ۱۰۰ وردپرس در ۱۲ ایستگاه.**
> فلسفه پروژه: **سرعت حرکت، ارزشمندتر از زمان است.**

---

## درباره پروژه

**Farghar WordPress Academy** یک اپلیکیشن تک‌صفحه‌ای (SPA) سبک، بدون وابستگی، و راست‌به‌چپ است که مسیر یادگیری وردپرس را در قالب یک ساعت ۱۲ ساعته تعاملی ارائه می‌دهد. هر ساعت یک ایستگاه از مسیر است و با کلیک روی آن، سرفصل‌های دوره باز می‌شود.

این پروژه به‌صورت اختصاصی برای دستگاه‌های کم‌توان مانند **Jio Phone 2 (KaiOS)**، ساعت‌های هوشمند، و حالت **Reduced Motion** بهینه‌سازی شده است.

---

## ساختار مسیر یادگیری

| شاخص | مقدار |
|------|-------|
| سطوح | ۶ سطح |
| دوره‌ها | ۱۲ دوره |
| موضوعات | ۲۴ موضوع |
| دروس | بیش از ۲۵۰ درس |
| مدت کل | حدود ۱۲ ساعت محتوای آموزشی |

### سطوح شش‌گانه

1. **سطح ۱** — شروع با وردپرس (آشنایی و کاربری)
2. **سطح ۲** — مدیریت حرفه‌ای محتوا
3. **سطح ۳** — طراحی سایت
4. **سطح ۴** — فروشگاه و امکانات
5. **سطح ۵** — سئو، امنیت و بهینه‌سازی
6. **سطح ۶** — توسعه‌دهنده وردپرس

---

## ویژگی‌های کلیدی

- **ساعت ۱۲ ساعته تعاملی** — هر ساعت یک دوره، با انیمیشن عقربه و پشتیبانی از D-pad
- **جست‌وجوی زنده** روی عنوان، توضیحات، سرفصل‌ها و برچسب‌ها
- **فیلتر چندلایه** — سطح، موضوع، رایگان، تخفیف‌دار
- **سه حالت ترتیب‌دهی** — ترتیب مسیر، کوتاه‌ترین، الفبا
- **حالت نمایش شبکه‌ای و فهرستی**
- **کاملاً واکنش‌گرا** — از عرض ۲۴۰ پیکسل تا دسکتاپ
- **حالت اختصاصی ساعت هوشمند** — با حاشیه امن برای صفحه‌های گرد
- **D-pad Friendly** — سازگار با KaiOS و Jio Phone 2
- **دسترس‌پذیری** — ARIA، Focus trap در Modal، پشتیبانی `prefers-reduced-motion` و `forced-colors`
- **صفر وابستگی** — بدون build، بدون npm، بدون فریم‌ورک

---

## پیش‌نیازها

برای اجرای این پروژه به هیچ ابزار خاصی نیاز نیست. فقط یک مرورگر مدرن کافی است. برای انتشار روی GitHub Pages، یک حساب GitHub و دسترسی به مخزن نیاز دارید.

---

## اجرای محلی

### روش اول — باز کردن مستقیم فایل

فایل `wp 6.html` را در مرورگر باز کنید. همین.

### روش دوم — سرور محلی

اگر مرورگر شما به هر دلیل از اجرای فایل محلی خودداری کرد، یک سرور ساده بالا بیاورید:

با پایتون ۳:

```bash
python -m http.server 8000
```

با Node.js (بدون نصب پکیج اضافه، فقط با `npx`):

```bash
npx serve .
```

سپس در مرورگر به آدرس زیر بروید:

```
http://localhost:8000
```

---

## انتشار روی GitHub Pages

انتشار این پروژه از طریق **GitHub Actions** و فایل `.github/workflows/deploy.yml` به‌طور خودکار انجام می‌شود. کافی است مخزن را روی شاخه `main` به‌روزرسانی کنید تا گردش‌کار اجرا شود.

### گام‌های یک‌باره در GitHub

1. وارد مخزن شوید: `https://github.com/USERNAME/REPO`
2. به **Settings** بروید و از نوار کناری چپ **Pages** را انتخاب کنید.
3. در بخش **Build and deployment**، گزینه **Source** را روی **GitHub Actions** قرار دهید. انتخاب `Deploy from a branch` در این پروژه کار نمی‌کند.
4. به **Settings** سپس **Actions** سپس **General** بروید و در بخش **Workflow permissions** گزینه **Read and write permissions** را فعال و ذخیره کنید.

### دستورات Push

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit: Farghar WordPress Academy SPA"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

پس از Push، به تب **Actions** مخزن بروید. گردش‌کار **Deploy to GitHub Pages** را خواهید دید که پس از چند ثانیه به رنگ سبز درمی‌آید. آدرس سایت شما فعال می‌شود:

```
https://USERNAME.github.io/REPO/
```

---

## ساختار مخزن

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml          GitHub Actions workflow for auto-deploy
├── .gitignore                  Git ignore rules
├── .nojekyll                   Disables Jekyll processing on GitHub Pages
├── LICENSE                     Farghar proprietary license
├── README.md                   This file
└── wp 6.html                   Main application (single-file SPA)
```

> **نکته مهم:** نام فایل اصلی `wp 6.html` دست‌نخورده باقی مانده است. گردش‌کار `deploy.yml` در لحظه انتشار، یک نسخه با نام `index.html` برای GitHub Pages تولید می‌کند.

---

## معماری داده

داده‌های اپلیکیشن از طریق Namespace سراسری `window.Farghar` قابل دسترسی و توسعه هستند:

```js
window.Farghar.data.LEVELS    // Six learning levels with colors
window.Farghar.data.TOPICS    // Twenty-four subject topics
window.Farghar.data.COURSES   // Twelve complete courses with lessons
```

### افزودن دوره جدید

برای افزودن دوره جدید، تنها یک آبجکت به آرایه `COURSES` اضافه کنید. ساعت، فیلترها، کارت‌ها و Modal به‌طور خودکار به‌روزرسانی می‌شوند.

```js
{
  id: 'new-course-id',
  title: 'نام دوره',
  level: 'l3',
  topics: ['themes', 'design'],
  desc: 'توضیح کوتاه دوره.',
  minutes: 600,
  price: 0,
  sale: false,
  lessons: ['درس اول', 'درس دوم']
}
```

---

## جدول بهینه‌سازی دستگاه

| دستگاه | شرط فعال‌سازی | رفتار |
|--------|----------------|-------|
| دسکتاپ | عرض بیش از ۱۰۴۰ پیکسل | تمام انیمیشن‌ها و hover فعال |
| تبلت و موبایل بزرگ | عرض ۵۶۰ تا ۱۰۴۰ پیکسل | لیست ساعت‌ها عمودی، Sidebar کشویی |
| موبایل کوچک | عرض ۳۲۰ تا ۵۶۰ پیکسل | فونت و پدینگ فشرده |
| Jio Phone 2 و KaiOS | عرض حداکثر ۳۲۰ پیکسل | انیمیشن خاموش، D-pad فوکوس، حالت کم‌مصرف |
| ساعت هوشمند مربعی | عرض حداکثر ۴۵۰ پیکسل با نسبت ۴:۵ تا ۵:۴ | حذف Hero و Footer، دیال حداقلی ۱۹۰ پیکسل |
| ساعت هوشمند افقی | عرض حداکثر ۴۵۰ پیکسل با نسبت ۵:۴ تا ۲۱:۹ | چیدمان دو ستونی فشرده |
| Reduced Motion | `prefers-reduced-motion: reduce` | تمام transitionها به حداقل می‌رسند |
| Forced Colors | `forced-colors: active` | کنتراست بالا برای دسترس‌پذیری |

---

## چک‌لیست دسترس‌پذیری

- پشتیبانی از `aria-label`، `aria-selected`، `aria-expanded`، `aria-pressed` و `role`
- Focus trap در Modal
- بازگشت فوکوس به عنصر قبلی پس از بستن Modal
- پشتیبانی از ناوبری با کلید Escape، Tab، Shift+Tab و کلیدهای جهت‌دار
- حالت `prefers-reduced-motion` برای کاهش انیمیشن‌ها
- حالت `forced-colors` برای کاربران با تنظیمات کنتراست بالا
- متن جایگزین برای تمام آیکون‌های SVG تعاملی

---

## نقشه راه آینده

- افزودن اسلایدر «حداکثر مدت زمان» (کد آماده در JS، رابط کاربری در HTML نیست)
- ذخیره‌سازی وضعیت فیلترها در `localStorage`
- حالت تاریک (Dark Mode) با Media Query
- تبدیل به PWA با `manifest.json` و Service Worker برای پشتیبانی آفلاین
- صفحه جزئیات اختصاصی برای هر درس
- پشتیبانی از مسیر یادگیری شخصی‌سازی‌شده

---

## عیب‌یابی مشکلات رایج GitHub Pages

| مشکل | راه‌حل |
|------|--------|
| خطای `Get Pages site failed` | Settings سپس Pages سپس Source را روی `GitHub Actions` بگذارید |
| خطای `Resource not accessible by integration` | Settings سپس Actions سپس General سپس `Read and write permissions` |
| خطای ۴۰۴ روی آدرس سایت | چند دقیقه صبر کنید؛ اولین انتشار ممکن است طول بکشد |
| خطای `Jekyll build failed` | فایل `.nojekyll` را در ریشه پروژه قرار دهید |
| Job در حالت Queued می‌ماند | مخزن باید Public باشد یا Pages در پلن پولی فعال شود |
| لیست فایل‌ها به‌جای سایت نمایش داده می‌شود | مطمئن شوید گردش‌کار فایل `index.html` را در آرتیفکت قرار داده است |

---

## اعتبارات

- فونت [Vazirmatn](https://github.com/rastikerdar/vazirmatn) اثر صابر راستی‌کردار — مجوز SIL OFL 1.1
- آیکون‌ها: SVGهای دست‌نویس داخل کد، بدون وابستگی به کتابخانه خارجی

---

## طراح و معمار

**Farghar**

فلسفه پروژه: **سرعت حرکت، ارزشمندتر از زمان است.**

---

## مجوز

© Farghar — تمامی حقوق مادی و معنوی محفوظ است.

این پروژه تحت **مجوز اختصاصی Farghar** منتشر شده است. برای جزئیات به فایل [LICENSE](./LICENSE) مراجعه کنید. هرگونه استفاده تجاری بدون اجازه کتبی ممنوع است.
