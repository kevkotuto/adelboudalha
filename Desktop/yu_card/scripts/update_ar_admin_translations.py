#!/usr/bin/env python3
import json

# Read the AR translation file
with open('/Users/adelboudalha/Desktop/yu_card/i18n/translations/ar.json', 'r', encoding='utf-8') as f:
    ar_data = json.load(f)

# Update admin_tabs with users and categories
ar_data["admin_tabs"] = {
    "dashboard": "لوحة التحكم",
    "orders": "الطلبات",
    "products": "المنتجات",
    "gift_codes": "الرموز",
    "users": "المستخدمون",
    "categories": "الفئات",
    "delivery": "التوصيل",
    "notifications": "الإشعارات",
    "settings": "الإعدادات"
}

# Add complete admin section in Arabic
ar_data["admin"] = {
    "common": {
        "search": "بحث...",
        "filter": "تصفية",
        "export": "تصدير",
        "import": "استيراد",
        "actions": "إجراءات",
        "bulk_actions": "إجراءات جماعية",
        "select_all": "تحديد الكل",
        "deselect_all": "إلغاء تحديد الكل",
        "delete_selected": "حذف المحدد",
        "refresh": "تحديث",
        "save": "حفظ",
        "cancel": "إلغاء",
        "edit": "تعديل",
        "delete": "حذف",
        "view": "عرض",
        "details": "التفاصيل",
        "status": "الحالة",
        "date": "التاريخ",
        "actions_menu": "قائمة الإجراءات",
        "no_data": "لا توجد بيانات",
        "loading": "جاري التحميل...",
        "error": "خطأ",
        "success": "نجح",
        "confirm": "تأكيد",
        "download": "تحميل",
        "upload": "رفع",
        "image": "صورة",
        "active": "نشط",
        "inactive": "غير نشط"
    },
    "dashboard": {
        "title": "لوحة التحكم الإدارية",
        "subtitle": "نظرة عامة على منصة Yu Card",
        "overview": "نظرة عامة",
        "quick_stats": "إحصائيات سريعة",
        "recent_activity": "النشاط الأخير",
        "analytics": "التحليلات",
        "revenue": "الإيرادات",
        "total_revenue": "إجمالي الإيرادات",
        "today_revenue": "إيرادات اليوم",
        "monthly_revenue": "الإيرادات الشهرية",
        "orders": "الطلبات",
        "total_orders": "إجمالي الطلبات",
        "pending_orders": "الطلبات المعلقة",
        "completed_orders": "الطلبات المكتملة",
        "users": "المستخدمون",
        "total_users": "إجمالي المستخدمين",
        "new_users": "مستخدمون جدد",
        "active_users": "مستخدمون نشطون",
        "products": "المنتجات",
        "total_products": "إجمالي المنتجات",
        "low_stock": "مخزون منخفض",
        "out_of_stock": "نفد المخزون",
        "gift_cards": "بطاقات الهدايا",
        "total_gift_cards": "إجمالي البطاقات",
        "active_codes": "الرموز النشطة",
        "used_codes": "الرموز المستخدمة",
        "period": {
            "today": "اليوم",
            "week": "هذا الأسبوع",
            "month": "هذا الشهر",
            "year": "هذا العام",
            "custom": "مخصص"
        },
        "charts": {
            "revenue_trend": "اتجاه الإيرادات",
            "orders_by_status": "الطلبات حسب الحالة",
            "top_products": "أفضل المنتجات",
            "user_growth": "نمو المستخدمين"
        }
    },
    "users": {
        "title": "إدارة المستخدمين",
        "subtitle": "إدارة حسابات المستخدمين والأدوار",
        "all_users": "جميع المستخدمين",
        "user_details": "تفاصيل المستخدم",
        "edit_user": "تعديل المستخدم",
        "suspend_user": "تعليق المستخدم",
        "activate_user": "تنشيط المستخدم",
        "delete_user": "حذف المستخدم",
        "user_info": "معلومات المستخدم",
        "full_name": "الاسم الكامل",
        "phone": "الهاتف",
        "email": "البريد الإلكتروني",
        "role": "الدور",
        "status": "الحالة",
        "created_at": "تاريخ الإنشاء",
        "last_login": "آخر تسجيل دخول",
        "wallet_balance": "رصيد المحفظة",
        "total_orders": "إجمالي الطلبات",
        "total_spent": "إجمالي الإنفاق",
        "filter_by_role": "تصفية حسب الدور",
        "filter_by_status": "تصفية حسب الحالة",
        "statuses": {
            "all": "الكل",
            "active": "نشط",
            "suspended": "معلق",
            "pending": "معلق"
        },
        "roles": {
            "all": "جميع الأدوار",
            "client": "عميل",
            "admin": "مدير",
            "super_admin": "مدير عام"
        },
        "wallet": {
            "title": "إدارة المحفظة",
            "credit": "إضافة رصيد",
            "debit": "خصم رصيد",
            "amount": "المبلغ",
            "description": "الوصف",
            "confirm_credit": "تأكيد الإضافة",
            "confirm_debit": "تأكيد الخصم",
            "current_balance": "الرصيد الحالي",
            "new_balance": "الرصيد الجديد"
        },
        "suspend_confirm": "تأكيد التعليق",
        "suspend_message": "هل أنت متأكد من تعليق هذا المستخدم؟",
        "activate_confirm": "تأكيد التنشيط",
        "activate_message": "هل أنت متأكد من تنشيط هذا المستخدم؟"
    },
    "orders": {
        "title": "إدارة الطلبات",
        "subtitle": "تتبع ومعالجة الطلبات",
        "all_orders": "جميع الطلبات",
        "order_details": "تفاصيل الطلب",
        "order_number": "رقم الطلب",
        "customer": "العميل",
        "order_date": "تاريخ الطلب",
        "status": "الحالة",
        "payment_status": "حالة الدفع",
        "total_amount": "المبلغ الإجمالي",
        "items": "العناصر",
        "shipping": "الشحن",
        "shipping_address": "عنوان الشحن",
        "delivery_date": "تاريخ التسليم",
        "tracking_number": "رقم التتبع",
        "filter_by_status": "تصفية حسب الحالة",
        "filter_by_payment": "تصفية حسب الدفع",
        "date_range": "نطاق التاريخ",
        "from_date": "من تاريخ",
        "to_date": "إلى تاريخ",
        "statuses": {
            "all": "الكل",
            "pending": "معلق",
            "confirmed": "مؤكد",
            "processing": "قيد المعالجة",
            "shipped": "تم الشحن",
            "delivered": "تم التسليم",
            "cancelled": "ملغي",
            "refunded": "مسترد"
        },
        "payment_statuses": {
            "all": "الكل",
            "pending": "معلق",
            "completed": "مكتمل",
            "failed": "فشل",
            "refunded": "مسترد"
        },
        "update_status": "تحديث الحالة",
        "change_status": "تغيير الحالة",
        "select_new_status": "اختر الحالة الجديدة",
        "status_updated": "تم تحديث الحالة",
        "export_csv": "تصدير CSV",
        "print_invoice": "طباعة الفاتورة",
        "send_notification": "إرسال إشعار",
        "refund_order": "استرداد الطلب",
        "cancel_order": "إلغاء الطلب",
        "confirm_cancel": "تأكيد الإلغاء",
        "confirm_refund": "تأكيد الاسترداد",
        "cancel_message": "هل أنت متأكد من إلغاء هذا الطلب؟",
        "refund_message": "هل أنت متأكد من استرداد هذا الطلب؟"
    },
    "products": {
        "title": "إدارة المنتجات",
        "subtitle": "إدارة كتالوج المنتجات",
        "all_products": "جميع المنتجات",
        "add_product": "إضافة منتج",
        "edit_product": "تعديل المنتج",
        "delete_product": "حذف المنتج",
        "product_details": "تفاصيل المنتج",
        "basic_info": "المعلومات الأساسية",
        "product_name": "اسم المنتج",
        "type": "النوع",
        "category": "الفئة",
        "description": "الوصف",
        "pricing": "التسعير",
        "price": "السعر",
        "cost_price": "سعر التكلفة",
        "discount": "الخصم",
        "inventory": "المخزون",
        "stock_quantity": "كمية المخزون",
        "sku": "SKU",
        "barcode": "الباركود",
        "track_inventory": "تتبع المخزون",
        "low_stock_threshold": "حد المخزون المنخفض",
        "images": "الصور",
        "upload_images": "رفع الصور",
        "main_image": "الصورة الرئيسية",
        "gallery": "المعرض",
        "settings": "الإعدادات",
        "is_popular": "منتج مشهور",
        "is_featured": "منتج مميز",
        "is_active": "نشط",
        "delivery_time": "وقت التسليم (أيام)",
        "warranty": "الضمان (أشهر)",
        "meta_keywords": "كلمات SEO",
        "confirm_delete": "تأكيد الحذف",
        "delete_warning": "هذا الإجراء غير قابل للتراجع",
        "low_stock": "مخزون منخفض",
        "out_of_stock": "نفد المخزون",
        "in_stock": "في المخزون",
        "views": "المشاهدات",
        "favorites": "المفضلة",
        "sales": "المبيعات",
        "types": {
            "all": "الكل",
            "physical": "منتج مادي",
            "gift_card": "بطاقة هدايا"
        },
        "stock_status": {
            "all": "الكل",
            "in_stock": "في المخزون",
            "low_stock": "مخزون منخفض",
            "out_of_stock": "نفد المخزون"
        }
    },
    "gift_cards": {
        "title": "إدارة بطاقات الهدايا",
        "subtitle": "إدارة البطاقات والرموز",
        "all_codes": "جميع الرموز",
        "generate_codes": "إنشاء رموز",
        "code": "الرمز",
        "amount": "المبلغ",
        "status": "الحالة",
        "created_at": "تاريخ الإنشاء",
        "expires_at": "تاريخ الانتهاء",
        "used_at": "تاريخ الاستخدام",
        "user": "المستخدم",
        "statuses": {
            "all": "الكل",
            "pending": "معلق",
            "active": "نشط",
            "used": "مستخدم",
            "expired": "منتهي",
            "cancelled": "ملغي"
        },
        "generation": {
            "title": "إنشاء رموز جديدة",
            "amount": "مبلغ البطاقة",
            "quantity": "الكمية",
            "expiry_days": "صلاحية (أيام)",
            "generate": "إنشاء",
            "generating": "جاري الإنشاء..."
        },
        "actions": {
            "activate": "تنشيط",
            "cancel": "إلغاء",
            "details": "التفاصيل",
            "copy": "نسخ الرمز",
            "share": "مشاركة"
        },
        "activation": {
            "title": "تنشيط بطاقة الهدايا",
            "email": "البريد الإلكتروني",
            "confirm": "تنشيط",
            "activating": "جاري التنشيط..."
        },
        "details": {
            "title": "تفاصيل البطاقة",
            "code": "الرمز",
            "amount": "المبلغ",
            "status": "الحالة",
            "created": "تاريخ الإنشاء",
            "expires": "تاريخ الانتهاء",
            "used": "تاريخ الاستخدام",
            "user_email": "بريد المستخدم"
        },
        "confirm_cancel": "تأكيد الإلغاء",
        "cancel_message": "هل أنت متأكد من إلغاء هذا الرمز؟",
        "success": {
            "generated": "تم إنشاء الرموز بنجاح",
            "activated": "تم تنشيط البطاقة",
            "cancelled": "تم إلغاء الرمز",
            "copied": "تم النسخ",
            "copiedDesc": "تم نسخ الرمز إلى الحافظة"
        },
        "errors": {
            "generateError": "فشل إنشاء الرموز",
            "activateError": "فشل التنشيط",
            "cancelError": "فشل الإلغاء",
            "copyError": "فشل النسخ",
            "emailRequired": "البريد الإلكتروني مطلوب"
        }
    },
    "categories": {
        "title": "إدارة الفئات",
        "subtitle": "تنظيم المنتجات والبطاقات",
        "all_categories": "جميع الفئات",
        "add_category": "إضافة فئة",
        "edit_category": "تعديل الفئة",
        "delete_category": "حذف الفئة",
        "category_name": "اسم الفئة",
        "description": "الوصف",
        "icon": "الأيقونة",
        "upload_icon": "رفع أيقونة",
        "products_count": "عدد المنتجات",
        "is_active": "نشط",
        "created_at": "تاريخ الإنشاء",
        "confirm_delete": "تأكيد الحذف",
        "delete_warning": "سيتم حذف هذه الفئة نهائياً",
        "success": {
            "created": "تم إنشاء الفئة",
            "updated": "تم تحديث الفئة",
            "deleted": "تم حذف الفئة"
        },
        "errors": {
            "createError": "فشل إنشاء الفئة",
            "updateError": "فشل التحديث",
            "deleteError": "فشل الحذف",
            "nameRequired": "الاسم مطلوب"
        }
    },
    "delivery": {
        "title": "إدارة التوصيل",
        "subtitle": "تتبع التوصيلات الجارية"
    },
    "notifications": {
        "title": "إدارة الإشعارات",
        "subtitle": "إرسال إشعارات للمستخدمين"
    },
    "reports": {
        "title": "التقارير المالية",
        "subtitle": "التحليلات والإحصائيات المالية"
    },
    "audit": {
        "title": "سجلات التدقيق",
        "subtitle": "سجل الإجراءات الإدارية"
    },
    "settings": {
        "title": "إعدادات الإدارة",
        "subtitle": "تكوين وإدارة نظام Yu Card"
    },
    "wallet": {
        "title": "إدارة المحفظة",
        "adjust_balance": "تعديل الرصيد",
        "credit": "إضافة",
        "debit": "خصم"
    },
    "stats": {
        "total_revenue": "إجمالي الإيرادات",
        "total_orders": "إجمالي الطلبات",
        "total_users": "إجمالي المستخدمين",
        "total_products": "إجمالي المنتجات",
        "total_wallet": "إجمالي المحافظ"
    },
    "messages": {
        "loading": "جاري التحميل...",
        "no_data": "لا توجد بيانات",
        "success": "نجح العملية",
        "error": "حدث خطأ",
        "confirm_action": "تأكيد الإجراء"
    }
}

# Write updated AR translations
with open('/Users/adelboudalha/Desktop/yu_card/i18n/translations/ar.json', 'w', encoding='utf-8') as f:
    json.dump(ar_data, f, ensure_ascii=False, indent=2)

print("✅ Traductions AR mises à jour avec succès!")
