<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/favicon.svg">
  <img alt="TaskBoard" src="public/favicon.svg" width="96" height="96">
</picture>

# TaskBoard

إدارة مهام ثنائية اللغة واحترافية للفرق والمدراء - كانبان، أدوار، تحليلات، تطبيق واحد ذاتي الاستضافة

[![الإصدار](https://img.shields.io/badge/الإصدار-4.1.1-2563eb?style=flat-square&logo=semver)](CHANGELOG.md)
[![الرخصة](https://img.shields.io/badge/الرخصة-MIT-10b981?style=flat-square)](LICENSE)
![Framework](https://img.shields.io/badge/framework-Next.js%2016-000000?style=flat-square&logo=nextdotjs)
![قاعدة البيانات](https://img.shields.io/badge/قاعدة_البيانات-SQLite-003b57?style=flat-square&logo=sqlite)
[![النجوم](https://img.shields.io/github/stars/red-shadows-rs/task-board?style=flat-square&color=eab308&logo=github&label=النجوم)](https://github.com/red-shadows-rs/task-board/stargazers)

</div>

---

## 🌐 اللغة

<a href="README.md">🇬🇧 English</a> · <a href="README_AR.md">🇸🇦 العربية</a>

---

## 📋 فهرس المحتويات

- [ما هو TaskBoard؟](#what-is-taskboard)
- [الأدوار والصلاحيات](#roles--permissions)
- [البدء السريع](#quick-start)
- [الأوامر](#commands)
- [متغيرات البيئة](#environment-variables)
- [المميزات](#features)
- [التقنيات المستخدمة](#tech-stack)
- [هيكل المشروع](#project-structure)
- [خارطة الطريق](#roadmap)
- [المساهمة](#contributing)
- [الأمان](#security)
- [سجل التغييرات](#changelog)
- [الرخصة](#license)

---

<a id="what-is-taskboard"></a>

## 🤔 ما هو TaskBoard؟

**TaskBoard** هو نظام إدارة مهام مجاني ومفتوح المصدر للفرق ثنائية اللغة - مبني أصلياً بالعربية والإنجليزية (تخطيط RTL كامل) وكُتب لحل المشاكل الجذرية الموجودة في الأدوات المستضافة. لا أسعار لكل مستخدم، لا خدمات خارجية، لا احتكار.

| المشكلة                   | الأدوات المستضافة             | TaskBoard                                              |
| ------------------------- | ----------------------------- | ------------------------------------------------------ |
| العربية مجرد إضافة لاحقة  | ❌ RTL مكسور وحقول غير مترجمة | ✅ ثنائي اللغة في كل شيء - العناوين، الأوصاف، التقارير |
| اشتراكات لكل مستخدم       | ❌ تكلفة شهرية لكل مستخدم     | ✅ ذاتي الاستضافة، رخصة MIT                            |
| خدمات قواعد بيانات خارجية | ❌ تتطلب قاعدة بيانات مُدارة  | ✅ SQLite مدمجة - صفر تبعيات                           |
| فصل ضعيف للأدوار          | ❌ الجميع يرى كل شيء          | ✅ نطاقات leader / member / client مفروضة من الخادم    |
| لا تقارير أصلية           | ❌ التصدير خلف جدران الدفع    | ✅ تقارير PDF ثنائية اللغة مدمجة                       |

---

<a id="roles--permissions"></a>

## 👥 الأدوار والصلاحيات

| الدور      | النطاق             | الصلاحيات                                                                   |
| ---------- | ------------------ | --------------------------------------------------------------------------- |
| **leader** | كل شيء             | إدارة المشاريع، الأقسام، المهام، المستخدمين، الأسعار - CRUD كامل في كل مكان |
| **member** | المهام المسندة فقط | عرض المهام المسندة إليه وتحديث حالتها والعمل على عناصر الكانبان الخاصة به   |
| **client** | مشاريعه فقط        | متابعة تقدم المشروع وتحرير المهام داخل مشاريعه والانضمام لعرض الفريق        |

جميع الصلاحيات مفروضة **على الخادم** في كل مسار API - والواجهة تعكس ببساطة ما يسمح به الخادم. أسعار المهام (`assigneePrices`) مرئية للقادة فقط وتُحذف من كل الاستجابات الأخرى.

---

<a id="quick-start"></a>

## 🚀 البدء السريع

```bash
git clone https://github.com/red-shadows-rs/task-board.git
cd task-board
npm install
cp .env.example .env.local
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في متصفحك.

### الحساب الأول

على قاعدة بيانات فارغة **يُرقَّى أول حساب يُنشأ تلقائياً إلى leader** (وضع bootstrap). بعد ذلك، وحدهم القادة يستطيعون إنشاء المستخدمين وإدارتهم من صفحة الفريق.

### الإنتاج

```bash
npm run build
npm start
```

المتطلبات:

- Node.js >= 20
- npm >= 10

---

<a id="commands"></a>

## ⌨️ الأوامر

| الأمر                  | الوصف                                                  |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | تشغيل خادم التطوير مع Turbopack                        |
| `npm run build`        | بناء نسخة الإنتاج                                      |
| `npm start`            | تشغيل خادم الإنتاج                                     |
| `npm run lint`         | تشغيل ESLint                                           |
| `npm run lint:fix`     | إصلاح مشاكل الـ lint تلقائياً                          |
| `npm run format`       | تنسيق الكود بـ Prettier                                |
| `npm run format:check` | فحص التنسيق                                            |
| `npm run type-check`   | فحص أنواع TypeScript                                   |
| `npm run validate`     | تحقق كامل (تنسيق + lint + أنواع) - مطلوب قبل كل commit |

---

<a id="environment-variables"></a>

## 🔧 متغيرات البيئة

انسخ `.env.example` إلى `.env.local` قبل أول تشغيل:

| المتغير          | مطلوب | الافتراضي     | الوصف                                                               |
| ---------------- | ----- | ------------- | ------------------------------------------------------------------- |
| `NODE_ENV`       | نعم   | `development` | وضع البيئة                                                          |
| `SESSION_SECRET` | نعم   | —             | مفتاح توقيع HMAC-SHA256 لكوكيز الجلسة - استخدم نصاً عشوائياً طويلاً |

التطبيق يرفض الإقلاع بدون `SESSION_SECRET`.

---

<a id="features"></a>

## ✨ المميزات

<table>
  <tr>
    <td width="50%">
      <h3>🎯 الأساسيات</h3>
      <ul>
        <li><strong>لوحة كانبان</strong> — سحب وإفلات المهام بين أقسام قابلة للتخصيص</li>
        <li><strong>إدارة المشاريع</strong> — إنشاء وتتبع المشاريع مع الحالات</li>
        <li><strong>إدارة المهام</strong> — أوصاف منسقة، مرفقات، وسوم، أولويات</li>
        <li><strong>إدارة الفريق</strong> — وصول حسب الدور: leader، member، client</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📊 التحليلات والتقارير</h3>
      <ul>
        <li><strong>لوحة تحليلات</strong> — رسوم بيانية تفاعلية عبر Recharts</li>
        <li><strong>تصدير PDF</strong> — تقارير المشاريع، الأقسام، المهام والتحليلات</li>
        <li><strong>تتبع التقدم</strong> — مؤشرات بصرية لحالة المشروع والمهمة</li>
        <li><strong>تسعير المهام</strong> — أسعار لكل مكلف مع مجاميع الأعمدة (للقادة فقط)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🎨 تجربة المستخدم</h3>
      <ul>
        <li><strong>ثنائي اللغة (EN/AR)</strong> — دعم RTL كامل مع خطوط Cairo/Inter</li>
        <li><strong>ثيم داكن/فاتح</strong> — ثيم HSL يتبع إعدادات النظام</li>
        <li><strong>محرر نصوص منسق</strong> — Tiptap مع محاذاة النص والتسطير</li>
        <li><strong>جاهز كـ PWA</strong> — قابل للتثبيت مع manifest للعمل دون اتصال</li>
        <li><strong>متجاوب</strong> — محسّن لسطح المكتب والتابلت والجوال</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🔒 الأمان</h3>
      <ul>
        <li><strong>مصادقة الجلسات</strong> — bcrypt + كوكيز httpOnly موقعة بـ HMAC-SHA256، تُبطل عند تغيير كلمة المرور</li>
        <li><strong>تحديد معدل الطلبات</strong> — لكل IP على مسارات المصادقة</li>
        <li><strong>التحقق من المدخلات</strong> — مخططات Zod على كل مسارات API</li>
        <li><strong>حماية XSS</strong> — تعقيم عبر DOMPurify</li>
        <li><strong>رؤوس الأمان</strong> — X-Frame-Options، nosniff، Referrer-Policy، Permissions-Policy</li>
      </ul>
    </td>
  </tr>
</table>

---

<a id="tech-stack"></a>

## 🧩 التقنيات المستخدمة

| الفئة               | التقنية                                                                                                           | الغرض                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **الإطار**          | [Next.js 16](https://nextjs.org/)                                                                                 | App Router + Turbopack |
| **الواجهة**         | [React 18](https://react.dev/) + [Radix UI](https://www.radix-ui.com/)                                            | مكونات الواجهة         |
| **التنسيق**         | [Tailwind CSS 3](https://tailwindcss.com/)                                                                        | CSS بمنهجية utilities  |
| **اللغة**           | [TypeScript 5](https://www.typescriptlang.org/)                                                                   | سلامة الأنواع          |
| **قاعدة البيانات**  | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)                                                      | SQLite مدمجة           |
| **المصادقة**        | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) + HMAC-SHA256                                                    | الجلسات                |
| **السحب والإفلات**  | [dnd-kit](https://dndkit.com/)                                                                                    | إعادة ترتيب الكانبان   |
| **النصوص المنسقة**  | [Tiptap](https://tiptap.dev/)                                                                                     | أوصاف المهام           |
| **النماذج**         | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)                                         | التحقق                 |
| **الحالة**          | [Zustand](https://zustand.docs.pmnd.rs/)                                                                          | حالة الواجهة العامة    |
| **الرسوم البيانية** | [Recharts](https://recharts.org/)                                                                                 | التحليلات              |
| **PDF**             | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) | التصدير                |
| **الحركات**         | [Framer Motion](https://www.framer.com/motion/)                                                                   | الانتقالات             |
| **الإشعارات**       | [react-hot-toast](https://react-hot-toast.com/)                                                                   | تنبيهات toast          |
| **التواريخ**        | [date-fns](https://date-fns.org/) + [react-day-picker](https://react-day-picker.js.org/)                          | معالجة التواريخ        |
| **الأيقونات**       | [Lucide React](https://lucide.dev/) + [Font Awesome 6](https://fontawesome.com/)                                  | الأيقونات              |
| **الـ Linting**     | [ESLint 9](https://eslint.org/) (flat config)                                                                     | جودة الكود             |
| **التنسيق**         | [Prettier](https://prettier.io/)                                                                                  | نمط الكود              |

---

<a id="project-structure"></a>

## 🏗️ هيكل المشروع

```
TaskBoard/
├── data/                       # قاعدة بيانات SQLite (تُنشأ عند التشغيل)
├── public/
│   ├── css/                    # Font Awesome
│   ├── fonts/                  # IBM Plex Sans Arabic (PDF)
│   ├── images/                 # مرفقات المهام
│   ├── locales/                # وحدات الترجمة (en/ar)
│   └── manifest.json           # PWA manifest
├── src/
│   ├── app/
│   │   ├── api/                # مسارات REST API
│   │   │   ├── auth/           # الدخول، الخروج، الجلسة
│   │   │   ├── images/         # خدمة المرفقات
│   │   │   ├── locales/        # قائمة وحدات الترجمة
│   │   │   ├── projects/       # CRUD المشاريع + إعادة الترتيب
│   │   │   ├── sections/       # CRUD الأقسام + إعادة الترتيب
│   │   │   ├── tasks/          # CRUD المهام + إعادة الترتيب + الصور
│   │   │   ├── users/          # CRUD المستخدمين + إعادة الترتيب
│   │   │   └── shared/         # تحديد المعدل، المدققات، الاستجابات
│   │   ├── dashboard/          # المهام، المشاريع، التحليلات، الفريق
│   │   ├── login/              # صفحة المصادقة
│   │   └── profile/            # ملف المستخدم الشخصي
│   ├── components/
│   │   ├── common/             # منطق مشترك (كانبان، مهام، رسوم)
│   │   ├── layouts/            # شريط التنقل، التذييل
│   │   ├── pages/              # مكونات الصفحات
│   │   └── ui/                 # مكونات UI الأساسية (بنمط shadcn/ui)
│   ├── contexts/               # اللغة + مخزن Zustand
│   ├── lib/
│   │   ├── auth.ts             # توقيع الجلسات، حراس RBAC
│   │   └── db.ts               # مخطط SQLite + طبقة البيانات
│   ├── types/                  # واجهات TypeScript
│   └── utils/                  # تصدير PDF، التسعير
├── .github/                    # قوالب Issues/PR، CI، workflow الإصدارات
├── CHANGELOG.md                # سجل الإصدارات
├── LICENSE                     # MIT
└── README.md                   # الملف الرئيسي
```

---

<a id="roadmap"></a>

## 🗺️ خارطة الطريق

- [x] قاعدة بيانات مدمجة (SQLite عبر better-sqlite3)
- [ ] إشعارات بريدية عند إسناد المهام
- [ ] دعم OAuth2 / الدخول الاجتماعي
- [ ] تحديثات لحظية عبر WebSocket
- [ ] إعداد نشر Docker
- [ ] اختبارات unit وintegration

---

<a id="contributing"></a>

## 🤝 المساهمة

1. Fork المستودع
2. أنشئ فرعاً جديداً: `git checkout -b feature/my-feature`
3. Commit التغييرات
4. Push إلى الفرع
5. افتح Pull Request

سير العمل الكامل، اصطلاح الكوميتات وعملية الإصدار في [CONTRIBUTING.md](CONTRIBUTING.md).

---

<a id="security"></a>

## 🔒 الأمان

للإبلاغ عن ثغرة أمنية، اتبع [سياسة الأمان](SECURITY.md). **لا تفتح issue عاماً.**

---

<a id="changelog"></a>

## 📝 سجل التغييرات

راجع [CHANGELOG.md](CHANGELOG.md) لسجل الإصدارات التفصيلي. يتبع هذا المشروع [الإصدار الدلالي](https://semver.org/).

| الإصدار    | التاريخ    | الأبرز                                                               |
| ---------- | ---------- | -------------------------------------------------------------------- |
| **v4.1.1** | 2026-08-27 | توحيد نمط كل ملفات التوثيق، بانر اللوغو SVG، روابط الريبو kebab-case |
| **v4.1.0** | 2026-08-27 | تخزين SQLite، RBAC على الخادم، جلسات محصنة، هيكلة GitHub             |
| **v4.0.6** | 2026-05-15 | تحديث اسم المؤلف، ضبط مواضيع المستودع                                |
| **v4.0.5** | 2026-05-14 | إصلاح السحب والإفلات على سطح المكتب، إصلاح أيقونات البيانات الوصفية  |
| v4.0.4     | 2026-05-14 | إزالة تعليقات تعطيل ESLint، إزالة console logs                       |
| v4.0.3     | 2026-05-14 | إصلاح روابط المستودع، تحديث الهوية، رفع الإصدار                      |
| v4.0.2     | 2026-05-14 | استعادة الأيقونة الأصلية، إضافة .env.example                         |
| v4.0.1     | 2026-05-14 | تحديث شامل للتوثيق، README عربي، تنظيف البيانات                      |
| v4.0.0     | 2026-05-14 | تحليلات، تصدير PDF، PWA، ثنائية اللغة، ثيم داكن/فاتح                 |
| v3.0.0     | 2026-04-01 | إدارة المشاريع/الأقسام، CRUD المهام، أدوار المستخدمين                |
| v2.0.0     | 2026-03-01 | واجهة كانبان، الحالات/الأولويات/الوسوم، لوحة التحكم                  |
| v1.0.0     | 2026-02-01 | الإعداد الأولي: Next.js App Router، الدخول، Tailwind                 |

---

<a id="license"></a>

## 📜 الرخصة

موزّع تحت [رخصة MIT](LICENSE).

---

<div align="center">

بُني بواسطة <a href="https://github.com/Shadow-x78">Shadow-x78</a> ·
<a href="https://github.com/red-shadows-rs">RED SHADOWS | RS</a> ·
[سجل التغييرات](CHANGELOG.md)

<sub>&copy; 2026 TaskBoard</sub>

</div>
