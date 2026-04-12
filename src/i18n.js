import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "appTitle": "Storage Hub",
      "inventory": "Inventory",
      "addPerfume": "Add Perfume",
      "settings": "Settings",
      "login": "Login",
      "logout": "Logout",
      "email": "Email Address",
      "password": "Password",
      "adminLogin": "Admin Access",
      "invalidCredentials": "Invalid email or password",
      "description": "Description",
      "seasons": "Seasons",
      "gender": "Gender",
      "summer": "Summer",
      "winter": "Winter",
      "spring": "Spring",
      "fall": "Fall",
      "male": "Male",
      "female": "Female",
      "unisex": "Unisex",
      "englishName": "English Name",
      "arabicRealName": "Arabic Real Name",
      "arabicMarketName": "Arabic Market Name",
      "totalPrice": "Total Price ($)",
      "totalVolume": "Total Weight (kg)",
      "save": "Save",
      "yes": "Yes",
      "cancel": "Cancel",
      "edit": "Edit",
      "delete": "Delete",
      "deductSales": "Deduct Sales (kg)",
      "sell": "Sell",
      "noItemsMessage": "No perfumes in inventory. Tap + to add.",
      "perfumeList": "Perfume List",
      "search": "Search name or code...",
      "add": "Add",
      "available": "Available",
      "confirmDelete": "Are you sure you want to delete this perfume?",
      "ml": "kg",
      "addStock": "Add KG",
      "clear": "Clear",
      "lightMode": "Light",
      "darkMode": "Dark",
      "perfumeCode": "Perfume Code",
      "standardUnit": "Standard Unit"
    }
  },
  ar: {
    translation: {
      "appTitle": "مستودع العطور",
      "inventory": "المخزون",
      "addPerfume": "إضافة عطر",
      "settings": "الإعدادات",
      "login": "دخول",
      "logout": "خروج",
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "adminLogin": "دخول المسؤول",
      "invalidCredentials": "بيانات الدخول غير صحيحة",
      "description": "الوصف",
      "seasons": "الفصول",
      "gender": "النوع",
      "summer": "صيفي",
      "winter": "شتوي",
      "spring": "ربيعي",
      "fall": "خريفي",
      "male": "رجالي",
      "female": "نسائي",
      "unisex": "للجنسين",
      "englishName": "الاسم الإنجليزي",
      "arabicRealName": "الاسم العربي",
      "arabicMarketName": "الاسم التجاري",
      "totalPrice": "السعر الإجمالي ($)",
      "totalVolume": "الوزن الإجمالي (كجم)",
      "save": "حفظ",
      "yes": "نعم",
      "cancel": "إلغاء",
      "edit": "تعديل",
      "delete": "حذف",
      "deductSales": "خصم المبيعات (كجم)",
      "sell": "خصم",
      "noItemsMessage": "لا توجد عطور في المخزون. اضغط + للإضافة.",
      "perfumeList": "قائمة العطور",
      "search": "البحث بالاسم أو الرمز...",
      "add": "إضافة",
      "available": "المتاح",
      "confirmDelete": "هل أنت متأكد من حذف هذا العطر؟",
      "ml": "كجم",
      "addStock": "إضافة",
      "clear": "مسح",
      "lightMode": "فاتح",
      "darkMode": "داكن",
      "perfumeCode": "رمز العطر",
      "standardUnit": "الوحدة القياسية"
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "ar", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
