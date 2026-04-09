# مشروع إرتديه - React + Firebase

هذا مشروع متجر إلكتروني عربي كامل لعلامة **إرتديه**، مبني بـ **React + Firebase**، ويدعم:

- عرض المنتجات حسب الأقسام: **الحجابات / العطور و الأمساك / العباءات**
- سلة مشتريات
- صفحة إتمام الطلب
- احتساب ثمن التوصيل حسب المدينة
- لوحة إدارة كاملة
- إضافة / تعديل / حذف المنتجات
- عرض الطلبيات وتغيير حالتها: **جديدة / مؤكدة / تم التوصيل**
- حذف الطلبيات القديمة أو الجديدة
- رفع صور المنتجات إلى Firebase Storage

---

## 1) إنشاء مشروع Firebase

أنصحك تسمية المشروع:

**ertadih-store**

أو إذا كان محجوز:

**ertadih-shop**

### من Firebase Console:
1. أنشئي مشروع جديد.
2. فعّلي **Authentication** ثم **Email/Password**.
3. فعّلي **Cloud Firestore** في Production.
4. فعّلي **Storage**.
5. من إعدادات المشروع > General > Your apps:
   - أضيفي Web App
   - خذي إعدادات Firebase وضعيها داخل ملف `.env`

انسخي `.env.example` إلى `.env` وعمّري القيم.

مثال:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=ertadih-store.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ertadih-store
VITE_FIREBASE_STORAGE_BUCKET=ertadih-store.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_EMAIL=admin@ertadih.com
```

---

## 2) حساب الإدارة

من Authentication أنشئي Admin User:

- **Email:** `admin@ertadih.com`
- **Password:** اختاري كلمة سر قوية

مهم جداً:
- إذا بدلتي الإيميل، بدليه كذلك هنا:
  - `.env`
  - `firestore.rules`
  - `storage.rules`

---

## 3) Firebase Rules

استعملي نفس الرولز الموجودة في الملفات:

- `firestore.rules`
- `storage.rules`

ثم اعملي Deploy للرولز.

### من الأوامر:
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy --only firestore:rules,storage
```

---

## 4) تشغيل المشروع محلياً

```bash
npm install
npm run dev
```

---

## 5) بناء المشروع

```bash
npm run build
```

---

## 6) Collections المستعملة في Firestore

### products
كل منتج فيه:
- `name`
- `description`
- `price`
- `stock`
- `category` → `hijabs` أو `perfumes` أو `abayas`
- `imageUrl`
- `createdAt`

### orders
كل طلبية فيها:
- `customerName`
- `phone`
- `cityId`
- `cityName`
- `address`
- `notes`
- `items`
- `subtotal`
- `shippingPrice`
- `total`
- `status` → `new / confirmed / delivered`
- `createdAt`

---

## 7) المدن وثمن التوصيل

موجودين في الملف:

`src/data/cities.js`

إذا بغيتي تبدلي الأثمنة أو تزيدي مدن، بدليهم من هذا الملف.

---

## 8) ملاحظات مهمة

- المشروع كله بالعربية و `dir="rtl"`.
- الألوان معمولة بدرجات القهوة + البيج + الأبيض.
- اللوغو الحالي SVG مدموج داخل المشروع ويمكن تبديله بسهولة.
- الصور الحقيقية للمنتجات سترفعينها من لوحة الإدارة.
- واجهة الإدارة موجودة هنا:

`/admin-login`

---

## 9) إذا بغيتي تنشريه

تقدري تنشريه على:
- Firebase Hosting
- Netlify
- Vercel

إذا نشرتيه على Firebase Hosting:

```bash
firebase init hosting
firebase deploy
```

---

## 10) معلومات SEO الحالية

تمت إضافة Meta Tags أساسية في `index.html` باستعمال هوية إرتديه.
إذا توفرت صور أو وصف رسمي أدق، يمكن تحسينها أكثر.
