<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/favicon.svg">
    <img alt="TaskBoard" src="public/favicon.svg" width="96" height="96">
  </picture>
</p>

<h1 align="center">تاسك بورد</h1>

<p align="center">
  <strong>نظام إدارة مهام احترافي للفرق والمدراء</strong>
</p>

<p align="center">
  <a href="https://github.com/red-shadows-rs/TaskBoard/blob/main/README.md">English</a>
  &nbsp;&bull;&nbsp;
  <a href="#-المميزات">المميزات</a>
  &nbsp;&bull;&nbsp;
  <a href="#-التقنيات-المستخدمة">التقنيات</a>
  &nbsp;&bull;&nbsp;
  <a href="#-بدء-الاستخدام">بدء الاستخدام</a>
  &nbsp;&bull;&nbsp;
  <a href="#-هيكل-المشروع">الهيكل</a>
  &nbsp;&bull;&nbsp;
  <a href="#-المساهمة">المساهمة</a>
  &nbsp;&bull;&nbsp;
  <a href="#-الترخيص">الترخيص</a>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/الإصدار-4.1.0-2563eb?style=for-the-badge" alt="الإصدار 4.1.0">
  <img src="https://img.shields.io/badge/الترخيص-MIT-10b981?style=for-the-badge" alt="ترخيص MIT">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3">
</p>

<br/>

---

## لماذا تاسك بورد؟

إدارة المشاريع عبر فرق ثنائية اللغة أمر صعب. تاسك بورد يسد هذه الفجوة بواجهة كانبان تدعم اللغتين العربية والإنجليزية بشكل أصلي — من التخطيط من اليمين لليسار إلى وصف المهام ثنائي اللغة. مبني على Next.js 16 مع تركيز على الأداء، الأمان، وتجربة المطور.

- **ثنائي اللغة بطبيعته** — كل ميزة تعمل بالعربية والإنجليزية، ليست إضافة لاحقة
- **مكتفٍ ذاتياً** — قاعدة بيانات SQLite مدمجة (better-sqlite3) تعني عدم الحاجة لأي خدمات خارجية
- **جاهز للإنتاج** — تحديد معدل الطلبات، رؤوس أمان، حماية XSS، ومصادقة بالجلسات
- **تصدير كل شيء** — إنشاء تقارير PDF للمشاريع، المهام، والتحليلات مع دعم الخطوط العربية

---

## ✨ المميزات

<table>
  <tr>
    <td width="50%">
      <h3>🎯 الأساسية</h3>
      <ul>
        <li><strong>لوحة كانبان</strong> — سحب وإفلات المهام عبر أقسام قابلة للتخصيص</li>
        <li><strong>إدارة المشاريع</strong> — إنشاء، تعديل، وتتبع المشاريع مع حالاتها</li>
        <li><strong>إدارة المهام</strong> — وصف نصي منسق، مرفقات، وسوم، أولويات</li>
        <li><strong>إدارة الفريق</strong> — صلاحيات مبنية على الأدوار: قائد، عضو، عميل</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📊 التحليلات والتقارير</h3>
      <ul>
        <li><strong>لوحة التحليلات</strong> — رسوم بيانية تفاعلية عبر Recharts</li>
        <li><strong>تصدير PDF</strong> — تقارير للمشاريع، الأقسام، المهام، والتحليلات</li>
        <li><strong>تتبع التقدم</strong> — مؤشرات بصرية لحالة المشاريع والمهام</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🎨 تجربة المستخدم</h3>
      <ul>
        <li><strong>ثنائي اللغة (عربي/إنجليزي)</strong> — دعم كامل للغة العربية مع خطوط Cairo/Inter</li>
        <li><strong>الوضع الداكن/الفاتح</strong> — تنسيق HSL متكيف مع النظام</li>
        <li><strong>محرر نصوص منسق</strong> — Tiptap مع محاذاة النص والتسطير</li>
        <li><strong>تطبيق ويب تقدمي (PWA)</strong> — قابل للتثبيت مع بيان تشغيل</li>
        <li><strong>متجاوب</strong> — محسّن للحاسوب، الجهاز اللوحي، والجوال</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🔒 الأمان</h3>
      <ul>
        <li><strong>مصادقة الجلسات</strong> — bcrypt + HMAC-SHA256 مع httpOnly cookies</li>
        <li><strong>تحديد المعدل</strong> — لكل IP على نقاط المصادقة</li>
        <li><strong>التحقق من المدخلات</strong> — مخططات Zod على جميع مسارات API</li>
        <li><strong>حماية XSS</strong> — تنقية DOMPurify</li>
        <li><strong>رؤوس الأمان</strong> — X-Frame-Options, CSP, Referrer-Policy</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🚀 التقنيات المستخدمة

| الفئة               | التقنية                                                                                                           | الغرض                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **الإطار**          | [Next.js 16](https://nextjs.org/)                                                                                 | App Router + Turbopack     |
| **الواجهة**         | [React 18](https://react.dev/) + [Radix UI](https://www.radix-ui.com/)                                            | مكونات أساسية              |
| **التنسيق**         | [Tailwind CSS 3](https://tailwindcss.com/)                                                                        | CSS بالأدوات المساعدة      |
| **اللغة**           | [TypeScript 5](https://www.typescriptlang.org/)                                                                   | أمان الأنواع               |
| **السحب والإفلات**  | [dnd-kit](https://dndkit.com/)                                                                                    | إعادة ترتيب كانبان         |
| **النص المنسق**     | [Tiptap](https://tiptap.dev/)                                                                                     | وصف المهام                 |
| **النماذج**         | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)                                         | التحقق                     |
| **الحالة**          | [Zustand](https://zustand.docs.pmnd.rs/)                                                                          | حالة واجهة المستخدم العامة |
| **الرسوم البيانية** | [Recharts](https://recharts.org/)                                                                                 | التحليلات                  |
| **PDF**             | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) | التصدير                    |
| **المصادقة**        | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) + HMAC-SHA256                                                    | الجلسات                    |
| **قاعدة البيانات**  | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)                                                      | SQLite مدمجة               |
| **الحركات**         | [Framer Motion](https://www.framer.com/motion/)                                                                   | الانتقالات                 |
| **الإشعارات**       | [react-hot-toast](https://react-hot-toast.com/)                                                                   | تنبيهات منبثقة             |
| **التواريخ**        | [date-fns](https://date-fns.org/) + [react-day-picker](https://react-day-picker.js.org/)                          | معالجة التواريخ            |
| **الأيقونات**       | [Lucide React](https://lucide.dev/) + [Font Awesome 6](https://fontawesome.com/)                                  | الأيقونات                  |
| **التدقيق**         | [ESLint 9](https://eslint.org/) (flat config)                                                                     | جودة الكود                 |
| **التنسيق**         | [Prettier](https://prettier.io/)                                                                                  | نمط الكود                  |

---

## 📦 بدء الاستخدام

### المتطلبات الأساسية

- **Node.js** >= 20
- **npm** >= 10

### البدء السريع

```bash
git clone https://github.com/red-shadows-rs/TaskBoard.git
cd taskboard
npm install
cp .env.example .env.local
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في متصفحك.

### الحساب الأول

عند أول تشغيل لا يوجد أي مستخدمين. أول حساب يتم إنشاؤه عبر التطبيق يُرقّى
تلقائياً إلى **قائد** (وضع التهيئة الأولية)، وبعد ذلك يمكن للقادة فقط إنشاء
المستخدمين وإدارتهم من صفحة الفريق.

### متغيرات البيئة

| المتغير          | مطلوب | الافتراضي     | الوصف                   |
| ---------------- | ----- | ------------- | ----------------------- |
| `NODE_ENV`       | نعم   | `development` | وضع البيئة              |
| `SESSION_SECRET` | نعم   | —             | مفتاح توقيع HMAC-SHA256 |

### الأوامر المتاحة

| الأمر                  | الوصف                             |
| ---------------------- | --------------------------------- |
| `npm run dev`          | تشغيل خادم التطوير مع Turbopack   |
| `npm run build`        | بناء للإنتاج                      |
| `npm start`            | تشغيل خادم الإنتاج                |
| `npm run lint`         | تشغيل ESLint                      |
| `npm run lint:fix`     | إصلاح تلقائي لمشاكل التنسيق       |
| `npm run format`       | تنسيق مع Prettier                 |
| `npm run format:check` | التحقق من التنسيق                 |
| `npm run type-check`   | التحقق من أنواع TypeScript        |
| `npm run validate`     | تحقق كامل (تنسيق + تدقيق + أنواع) |

---

## 📁 هيكل المشروع

```
TaskBoard/
├── data/                       # قاعدة بيانات SQLite (تُنشأ عند التشغيل)
├── public/
│   ├── css/                    # Font Awesome
│   ├── fonts/                  # IBM Plex Sans Arabic (PDF)
│   ├── images/                 # مرفقات المهام
│   ├── locales/                # الترجمة (عربي/إنجليزي)
│   └── manifest.json           # بيان PWA
├── src/
│   ├── app/
│   │   ├── api/                # مسارات REST API
│   │   │   ├── auth/           # تسجيل الدخول، الخروج، الجلسة
│   │   │   ├── projects/       # CRUD المشاريع
│   │   │   ├── sections/       # CRUD الأقسام + إعادة الترتيب
│   │   │   ├── tasks/          # CRUD المهام + إعادة الترتيب + الصور
│   │   │   ├── users/          # CRUD المستخدمين + إعادة الترتيب
│   │   │   └── shared/         # تحديد المعدل، المحققات، الردود
│   │   ├── dashboard/          # المهام، المشاريع، التحليلات، الفريق
│   │   ├── login/              # صفحة المصادقة
│   │   └── profile/            # الملف الشخصي
│   ├── components/
│   │   ├── common/             # منطق مشترك
│   │   ├── layouts/            # الشريط العلوي، التذييل
│   │   ├── pages/              # مكونات على مستوى الصفحات
│   │   └── ui/                 # مكونات واجهة أساسية
│   ├── contexts/               # اللغة + متجر Zustand
│   ├── lib/                    # جلسات المصادقة + طبقة بيانات SQLite
│   ├── types/                  # واجهات TypeScript
│   └── utils/                  # تصدير PDF، التسعير
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE
├── README.md
├── README_AR.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🗺️ خارطة الطريق

- [x] قاعدة بيانات مدمجة (SQLite عبر better-sqlite3)
- [ ] إشعارات بريد إلكتروني لتعيينات المهام
- [ ] دعم تسجيل الدخول عبر OAuth2 / الشبكات الاجتماعية
- [ ] تحديثات فورية عبر WebSocket
- [ ] إعداد نشر Docker
- [ ] اختبارات الوحدة والتكامل

---

## 🤝 المساهمة

نرحب بالمساهمات. يرجى قراءة [دليل المساهمة](./CONTRIBUTING.md) و[مدونة السلوك](./CODE_OF_CONDUCT.md) قبل تقديم طلب سحب.

1. قم بعمل fork للمستودع
2. أنشئ فرعاً للميزة (`git checkout -b feature/ميزة-رائعة`)
3. قم بعمل commit للتغييرات (`git commit -m 'إضافة ميزة رائعة'`)
4. ادفع إلى الفرع (`git push origin feature/ميزة-رائعة`)
5. افتح طلب سحب (Pull Request)

---

## 🔒 الأمان

للإبلاغ عن ثغرة أمنية، يرجى اتباع [سياسة الأمان](./SECURITY.md) الخاصة بنا. لا تفتح مشكلة عامة.

---

## 📝 سجل التغييرات

اطلع على [CHANGELOG.md](./CHANGELOG.md) لسجل مفصل بالإصدارات. يتبع هذا المشروع [الإصدارات الدلالية](https://semver.org/).

| الإصدار   | التاريخ    | أبرز المميزات                                                                   |
| --------- | ---------- | ------------------------------------------------------------------------------- |
| **4.1.0** | 2026-08-27 | تخزين SQLite، صلاحيات RBAC على الخادم، جلسات محصنة، تنظيف الواجهات البرمجية     |
| **4.0.6** | 2026-05-15 | تحديث اسم المؤلف، إضافة مواضيع GitHub repo                                      |
| **4.0.5** | 2026-05-14 | إصلاح السحب والإفلات على سطح المكتب، إصلاح أيقونات metadata، حذف تعليقات ESLint |
| 4.0.4     | 2026-05-14 | حذف تعليقات ESLint، حذف console logs، إضافة tags المفقودة                       |
| 4.0.3     | 2026-05-14 | إصلاح روابط المستودع، تحديث العلامة التجارية، رفع الإصدار                       |
| 4.0.2     | 2026-05-14 | استعادة الأيقونة الأصلية، إضافة .env.example                                    |
| 4.0.1     | 2026-05-14 | تجديد التوثيق، README بالعربية، تحسين الأيقونات، تنظيف البيانات                 |
| 4.0.0     | 2026-05-14 | التحليلات، تصدير PDF، PWA، ثنائي اللغة، الوضع الداكن/الفاتح، السحب والإفلات     |
| 3.0.0     | 2026-04-01 | إدارة المشاريع/الأقسام، CRUD المهام، أدوار المستخدمين، مصادقة الجلسات           |
| 2.0.0     | 2026-03-01 | واجهة كانبان، حالات/أولويات/وسوم المهام، تخطيط لوحة التحكم                      |
| 1.0.0     | 2026-02-01 | الإعداد الأولي: Next.js App Router، صفحة الدخول، Tailwind CSS                   |

---

## 📄 الترخيص

هذا المشروع مرخص تحت [رخصة MIT](./LICENSE).

---

## 👤 المؤلف

[**Shadow-x78**](https://github.com/Shadow-x78) — RED SHADOWS | RS

---

<p align="center">
  <sub>صُنع بـ ❤️ من <a href="https://github.com/red-shadows-rs">RED SHADOWS | RS</a></sub>
</p>
