#!/usr/bin/env python3
import json

# Read the BM translation file
with open('/Users/adelboudalha/Desktop/yu_card/i18n/translations/bm.json', 'r', encoding='utf-8') as f:
    bm_data = json.load(f)

# Update admin_tabs with users and categories
bm_data["admin_tabs"] = {
    "dashboard": "Kunnafonisɛbɛn",
    "orders": "Caamuw",
    "products": "Fɛnw",
    "gift_codes": "Codew",
    "users": "Baarakɛlaw",
    "categories": "Suguyaw",
    "delivery": "Di",
    "notifications": "Kunnafoniw",
    "settings": "Labɛn"
}

# Add complete admin section in Bambara
bm_data["admin"] = {
    "common": {
        "search": "Ka ɲini...",
        "filter": "Ka sugu",
        "export": "Ka bɔ",
        "import": "Ka don",
        "actions": "Baaraw",
        "bulk_actions": "Baara caman",
        "select_all": "Bɛɛ sugandi",
        "deselect_all": "Bɛɛ banna",
        "delete_selected": "Sugandilenw bɔ",
        "refresh": "Ka kura",
        "save": "Ka mara",
        "cancel": "Ka banna",
        "edit": "Ka ladamu",
        "delete": "Ka bɔ",
        "view": "Ka lajɛ",
        "details": "Kunnafoniw",
        "status": "Cogoya",
        "date": "Don",
        "actions_menu": "Baara lisɛli",
        "no_data": "Kunnafoni foyi",
        "loading": "Ka doni...",
        "error": "Fili",
        "success": "A kɛlɛn",
        "confirm": "Ka tilatara",
        "download": "Ka telesarse",
        "upload": "Ka bila",
        "image": "Ja",
        "active": "Ka baara kɛ",
        "inactive": "Baara tɛ"
    },
    "dashboard": {
        "title": "Baarakɛcogo Kunnafonisɛbɛn",
        "subtitle": "Yu Card plateforme lajɛ",
        "overview": "Lajɛ",
        "quick_stats": "Jateden teliya",
        "recent_activity": "Baara laban",
        "analytics": "Jateminɛw",
        "revenue": "Wariko",
        "total_revenue": "Wariko bɛɛ",
        "today_revenue": "Bi wariko",
        "monthly_revenue": "Kalo wariko",
        "orders": "Caamuw",
        "total_orders": "Caamu bɛɛ",
        "pending_orders": "Caamu makɔnɔw",
        "completed_orders": "Caamu dafalen",
        "users": "Baarakɛlaw",
        "total_users": "Baarakɛla bɛɛ",
        "new_users": "Baarakɛla kuraw",
        "active_users": "Baarakɛla ka baara kɛ",
        "products": "Fɛnw",
        "total_products": "Fɛn bɛɛ",
        "low_stock": "Mara dɔgɔ",
        "out_of_stock": "Mara ban",
        "gift_cards": "Hadiya karitiw",
        "total_gift_cards": "Kariti bɛɛ",
        "active_codes": "Code ka baara kɛ",
        "used_codes": "Code kɛra",
        "period": {
            "today": "Bi",
            "week": "Dɔgɔkun in",
            "month": "Kalo in",
            "year": "San in",
            "custom": "Sugandilen"
        },
        "charts": {
            "revenue_trend": "Wariko ɲɛtaa",
            "orders_by_status": "Caamu cogoya fɛ",
            "top_products": "Fɛn ɲumanw",
            "user_growth": "Baarakɛla yɛlɛma"
        }
    },
    "users": {
        "title": "Baarakɛla Kunnafonidilan",
        "subtitle": "Baarakɛla jago ani baara kunnafonidilan",
        "all_users": "Baarakɛla bɛɛ",
        "user_details": "Baarakɛla kunnafoniw",
        "edit_user": "Baarakɛla ladamu",
        "suspend_user": "Baarakɛla dabɔ",
        "activate_user": "Baarakɛla baara",
        "delete_user": "Baarakɛla bɔ",
        "user_info": "Baarakɛla kunnafoni",
        "full_name": "Tɔgɔ kɛlɛn",
        "phone": "Telefɔni",
        "email": "Bataki",
        "role": "Baara",
        "status": "Cogoya",
        "created_at": "Dalenni don",
        "last_login": "Don laban",
        "wallet_balance": "Wallet wariko",
        "total_orders": "Caamu bɛɛ",
        "total_spent": "Wari bɛɛ",
        "filter_by_role": "Baara fɛ sugu",
        "filter_by_status": "Cogoya fɛ sugu",
        "statuses": {
            "all": "Bɛɛ",
            "active": "Ka baara kɛ",
            "suspended": "Dabɔlen",
            "pending": "Makɔnɔ"
        },
        "roles": {
            "all": "Baara bɛɛ",
            "client": "Kiliyan",
            "admin": "Administratɛri",
            "super_admin": "Administratɛri kɔrɔba"
        },
        "wallet": {
            "title": "Wallet Kunnafonidilan",
            "credit": "Ka wari bila",
            "debit": "Ka wari bɔ",
            "amount": "Jatɛminen",
            "description": "Ɲɛfɔli",
            "confirm_credit": "Wari bila tilatara",
            "confirm_debit": "Wari bɔ tilatara",
            "current_balance": "Wariko sisan",
            "new_balance": "Wariko kura"
        },
        "suspend_confirm": "Dabɔli tilatara",
        "suspend_message": "I bɛna o baarakɛla dabɔ tilin?",
        "activate_confirm": "Baara tilatara",
        "activate_message": "I bɛna o baarakɛla baara tilin?"
    },
    "orders": {
        "title": "Caamu Kunnafonidilan",
        "subtitle": "Caamu lajɛli ani baara",
        "all_orders": "Caamu bɛɛ",
        "order_details": "Caamu kunnafoniw",
        "order_number": "Caamu nimoro",
        "customer": "Kiliyan",
        "order_date": "Caamu don",
        "status": "Cogoya",
        "payment_status": "Sarali cogoya",
        "total_amount": "Jatɛminen bɛɛ",
        "items": "Fɛnw",
        "shipping": "Ci",
        "shipping_address": "Ci yɔrɔ",
        "delivery_date": "Di don",
        "tracking_number": "Lajɛli nimoro",
        "filter_by_status": "Cogoya fɛ sugu",
        "filter_by_payment": "Sarali fɛ sugu",
        "date_range": "Don janya",
        "from_date": "Don fɔlɔ",
        "to_date": "Don laban",
        "statuses": {
            "all": "Bɛɛ",
            "pending": "Makɔnɔ",
            "confirmed": "Tilataralen",
            "processing": "Ka baara kɛ",
            "shipped": "Cigama",
            "delivered": "Dilama",
            "cancelled": "Dabɔra",
            "refunded": "Seginna"
        },
        "payment_statuses": {
            "all": "Bɛɛ",
            "pending": "Makɔnɔ",
            "completed": "Dafalen",
            "failed": "Filinw",
            "refunded": "Seginna"
        },
        "update_status": "Cogoya kɛra",
        "change_status": "Cogoya ɔɔlɔn",
        "select_new_status": "Cogoya kura sugandi",
        "status_updated": "Cogoya kɛrara",
        "export_csv": "CSV bɔ",
        "print_invoice": "Fakture gafe",
        "send_notification": "Kunnafoni ci",
        "refund_order": "Caamu segin",
        "cancel_order": "Caamu dabɔ",
        "confirm_cancel": "Dabɔli tilatara",
        "confirm_refund": "Seginni tilatara",
        "cancel_message": "I bɛna o caamu dabɔ tilin?",
        "refund_message": "I bɛna o caamu segin tilin?"
    },
    "products": {
        "title": "Fɛn Kunnafonidilan",
        "subtitle": "Fɛn katalɔgu kunnafonidilan",
        "all_products": "Fɛn bɛɛ",
        "add_product": "Fɛn farɔ",
        "edit_product": "Fɛn ladamu",
        "delete_product": "Fɛn bɔ",
        "product_details": "Fɛn kunnafoniw",
        "basic_info": "Kunnafoni jɛya",
        "product_name": "Fɛn tɔgɔ",
        "type": "Sugu",
        "category": "Suguya",
        "description": "Ɲɛfɔli",
        "pricing": "Musakaw",
        "price": "Musaka",
        "cost_price": "Musaka jɔli",
        "discount": "Dɔncɔgo",
        "inventory": "Mara",
        "stock_quantity": "Mara hakɛ",
        "sku": "SKU",
        "barcode": "Barcode",
        "track_inventory": "Mara lajɛli",
        "low_stock_threshold": "Mara dɔgɔ dan",
        "images": "Jaw",
        "upload_images": "Jaw bila",
        "main_image": "Ja jɛya",
        "gallery": "Ja yɔrɔ",
        "settings": "Labɛnw",
        "is_popular": "Fɛn dibalen",
        "is_featured": "Fɛn jiralen",
        "is_active": "Ka baara kɛ",
        "delivery_time": "Di waati (taaw)",
        "warranty": "Garanti (kalow)",
        "meta_keywords": "SEO daɲɛw",
        "confirm_delete": "Bɔli tilatara",
        "delete_warning": "O baara tɛ se ka segin",
        "low_stock": "Mara dɔgɔ",
        "out_of_stock": "Mara ban",
        "in_stock": "Mara bɛ yen",
        "views": "Lajɛliw",
        "favorites": "Diyalenw",
        "sales": "Feere",
        "types": {
            "all": "Bɛɛ",
            "physical": "Fɛn tilenna",
            "gift_card": "Hadiya kariti"
        },
        "stock_status": {
            "all": "Bɛɛ",
            "in_stock": "Mara bɛ yen",
            "low_stock": "Mara dɔgɔ",
            "out_of_stock": "Mara ban"
        }
    },
    "gift_cards": {
        "title": "Hadiya Kariti Kunnafonidilan",
        "subtitle": "Kariti ani codew kunnafonidilan",
        "all_codes": "Code bɛɛ",
        "generate_codes": "Codew da",
        "code": "Code",
        "amount": "Jatɛminen",
        "status": "Cogoya",
        "created_at": "Dalenni don",
        "expires_at": "Ban don",
        "used_at": "Kɛra don",
        "user": "Baarakɛla",
        "statuses": {
            "all": "Bɛɛ",
            "pending": "Makɔnɔ",
            "active": "Ka baara kɛ",
            "used": "Kɛrara",
            "expired": "Bannen",
            "cancelled": "Dabɔra"
        },
        "generation": {
            "title": "Code kuraw da",
            "amount": "Kariti jatɛminen",
            "quantity": "Hakɛ",
            "expiry_days": "Cogoya (taaw)",
            "generate": "Da",
            "generating": "Ka da..."
        },
        "actions": {
            "activate": "Ka baara",
            "cancel": "Ka dabɔ",
            "details": "Kunnafoniw",
            "copy": "Code kopi",
            "share": "Tila"
        },
        "activation": {
            "title": "Hadiya kariti baara",
            "email": "Bataki",
            "confirm": "Baara",
            "activating": "Ka baara..."
        },
        "details": {
            "title": "Kariti kunnafoniw",
            "code": "Code",
            "amount": "Jatɛminen",
            "status": "Cogoya",
            "created": "Dalenni don",
            "expires": "Ban don",
            "used": "Kɛra don",
            "user_email": "Baarakɛla bataki"
        },
        "confirm_cancel": "Dabɔli tilatara",
        "cancel_message": "I bɛna o code dabɔ tilin?",
        "success": {
            "generated": "Codew dara kɛlɛn",
            "activated": "Kariti baarara",
            "cancelled": "Code dabɔra",
            "copied": "Kopira",
            "copiedDesc": "Code kopira clipboard la"
        },
        "errors": {
            "generateError": "Code da filinw",
            "activateError": "Baara filinw",
            "cancelError": "Dabɔli filinw",
            "copyError": "Kopi filinw",
            "emailRequired": "Bataki ka kan"
        }
    },
    "categories": {
        "title": "Suguya Kunnafonidilan",
        "subtitle": "Fɛnw ani karitiw labɛn",
        "all_categories": "Suguya bɛɛ",
        "add_category": "Suguya farɔ",
        "edit_category": "Suguya ladamu",
        "delete_category": "Suguya bɔ",
        "category_name": "Suguya tɔgɔ",
        "description": "Ɲɛfɔli",
        "icon": "Taamasiyɛn",
        "upload_icon": "Taamasiyɛn bila",
        "products_count": "Fɛn hakɛ",
        "is_active": "Ka baara kɛ",
        "created_at": "Dalenni don",
        "confirm_delete": "Bɔli tilatara",
        "delete_warning": "O suguya bɛna bɔ kaban kaban",
        "success": {
            "created": "Suguya dara",
            "updated": "Suguya kɛrara",
            "deleted": "Suguya bɔra"
        },
        "errors": {
            "createError": "Suguya da filinw",
            "updateError": "Kɛra filinw",
            "deleteError": "Bɔli filinw",
            "nameRequired": "Tɔgɔ ka kan"
        }
    },
    "delivery": {
        "title": "Di Kunnafonidilan",
        "subtitle": "Di ka baara kɛ lajɛli"
    },
    "notifications": {
        "title": "Kunnafoni Kunnafonidilan",
        "subtitle": "Baarakɛlaw ma kunnafoni ci"
    },
    "reports": {
        "title": "Wariko Rapɔriw",
        "subtitle": "Wariko jateminɛw ani jatedenw"
    },
    "audit": {
        "title": "Audit Logs",
        "subtitle": "Administratɛri baara tariku"
    },
    "settings": {
        "title": "Admin Labɛnw",
        "subtitle": "Yu Card sistɛmu labɛn ani kunnafonidilan"
    },
    "wallet": {
        "title": "Wallet Kunnafonidilan",
        "adjust_balance": "Wariko ladamu",
        "credit": "Wari bila",
        "debit": "Wari bɔ"
    },
    "stats": {
        "total_revenue": "Wariko bɛɛ",
        "total_orders": "Caamu bɛɛ",
        "total_users": "Baarakɛla bɛɛ",
        "total_products": "Fɛn bɛɛ",
        "total_wallet": "Wallet bɛɛ"
    },
    "messages": {
        "loading": "Ka doni...",
        "no_data": "Kunnafoni foyi",
        "success": "Baara kɛlɛn",
        "error": "Fili yɛlɛma",
        "confirm_action": "Baara tilatara"
    }
}

# Write updated BM translations
with open('/Users/adelboudalha/Desktop/yu_card/i18n/translations/bm.json', 'w', encoding='utf-8') as f:
    json.dump(bm_data, f, ensure_ascii=False, indent=2)

print("✅ Traductions BM mises à jour avec succès!")
