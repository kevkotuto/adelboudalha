#!/usr/bin/env python3
import json

# Read the ES translation file
with open('/Users/adelboudalha/Desktop/yu_card/i18n/translations/es.json', 'r', encoding='utf-8') as f:
    es_data = json.load(f)

# Update admin_tabs with users and categories
es_data["admin_tabs"] = {
    "dashboard": "Panel",
    "orders": "Pedidos",
    "products": "Productos",
    "gift_codes": "Códigos",
    "users": "Usuarios",
    "categories": "Categorías",
    "delivery": "Entrega",
    "notifications": "Notificaciones",
    "settings": "Configuración"
}

# Add complete admin section in Spanish
es_data["admin"] = {
    "common": {
        "search": "Buscar...",
        "filter": "Filtrar",
        "export": "Exportar",
        "import": "Importar",
        "actions": "Acciones",
        "bulk_actions": "Acciones masivas",
        "select_all": "Seleccionar todo",
        "deselect_all": "Deseleccionar todo",
        "delete_selected": "Eliminar seleccionados",
        "refresh": "Actualizar",
        "save": "Guardar",
        "cancel": "Cancelar",
        "edit": "Editar",
        "delete": "Eliminar",
        "view": "Ver",
        "details": "Detalles",
        "status": "Estado",
        "date": "Fecha",
        "actions_menu": "Menú de acciones",
        "no_data": "Sin datos",
        "loading": "Cargando...",
        "error": "Error",
        "success": "Éxito",
        "confirm": "Confirmar",
        "download": "Descargar",
        "upload": "Subir",
        "image": "Imagen",
        "active": "Activo",
        "inactive": "Inactivo"
    },
    "dashboard": {
        "title": "Panel de Administración",
        "subtitle": "Resumen de la plataforma Yu Card",
        "overview": "Resumen",
        "quick_stats": "Estadísticas rápidas",
        "recent_activity": "Actividad reciente",
        "analytics": "Analíticas",
        "revenue": "Ingresos",
        "total_revenue": "Ingresos totales",
        "today_revenue": "Ingresos de hoy",
        "monthly_revenue": "Ingresos mensuales",
        "orders": "Pedidos",
        "total_orders": "Total de pedidos",
        "pending_orders": "Pedidos pendientes",
        "completed_orders": "Pedidos completados",
        "users": "Usuarios",
        "total_users": "Total de usuarios",
        "new_users": "Nuevos usuarios",
        "active_users": "Usuarios activos",
        "products": "Productos",
        "total_products": "Total de productos",
        "low_stock": "Stock bajo",
        "out_of_stock": "Sin stock",
        "gift_cards": "Tarjetas regalo",
        "total_gift_cards": "Total de tarjetas",
        "active_codes": "Códigos activos",
        "used_codes": "Códigos usados",
        "period": {
            "today": "Hoy",
            "week": "Esta semana",
            "month": "Este mes",
            "year": "Este año",
            "custom": "Personalizado"
        },
        "charts": {
            "revenue_trend": "Tendencia de ingresos",
            "orders_by_status": "Pedidos por estado",
            "top_products": "Mejores productos",
            "user_growth": "Crecimiento de usuarios"
        }
    },
    "users": {
        "title": "Gestión de Usuarios",
        "subtitle": "Administrar cuentas de usuario y roles",
        "all_users": "Todos los usuarios",
        "user_details": "Detalles del usuario",
        "edit_user": "Editar usuario",
        "suspend_user": "Suspender usuario",
        "activate_user": "Activar usuario",
        "delete_user": "Eliminar usuario",
        "user_info": "Información del usuario",
        "full_name": "Nombre completo",
        "phone": "Teléfono",
        "email": "Correo electrónico",
        "role": "Rol",
        "status": "Estado",
        "created_at": "Fecha de creación",
        "last_login": "Último acceso",
        "wallet_balance": "Saldo de la billetera",
        "total_orders": "Total de pedidos",
        "total_spent": "Total gastado",
        "filter_by_role": "Filtrar por rol",
        "filter_by_status": "Filtrar por estado",
        "statuses": {
            "all": "Todos",
            "active": "Activo",
            "suspended": "Suspendido",
            "pending": "Pendiente"
        },
        "roles": {
            "all": "Todos los roles",
            "client": "Cliente",
            "admin": "Administrador",
            "super_admin": "Super Administrador"
        },
        "wallet": {
            "title": "Gestión de Billetera",
            "credit": "Acreditar",
            "debit": "Debitar",
            "amount": "Cantidad",
            "description": "Descripción",
            "confirm_credit": "Confirmar crédito",
            "confirm_debit": "Confirmar débito",
            "current_balance": "Saldo actual",
            "new_balance": "Nuevo saldo"
        },
        "suspend_confirm": "Confirmar suspensión",
        "suspend_message": "¿Está seguro de suspender este usuario?",
        "activate_confirm": "Confirmar activación",
        "activate_message": "¿Está seguro de activar este usuario?"
    },
    "orders": {
        "title": "Gestión de Pedidos",
        "subtitle": "Seguimiento y procesamiento de pedidos",
        "all_orders": "Todos los pedidos",
        "order_details": "Detalles del pedido",
        "order_number": "Número de pedido",
        "customer": "Cliente",
        "order_date": "Fecha del pedido",
        "status": "Estado",
        "payment_status": "Estado del pago",
        "total_amount": "Monto total",
        "items": "Artículos",
        "shipping": "Envío",
        "shipping_address": "Dirección de envío",
        "delivery_date": "Fecha de entrega",
        "tracking_number": "Número de seguimiento",
        "filter_by_status": "Filtrar por estado",
        "filter_by_payment": "Filtrar por pago",
        "date_range": "Rango de fechas",
        "from_date": "Desde",
        "to_date": "Hasta",
        "statuses": {
            "all": "Todos",
            "pending": "Pendiente",
            "confirmed": "Confirmado",
            "processing": "Procesando",
            "shipped": "Enviado",
            "delivered": "Entregado",
            "cancelled": "Cancelado",
            "refunded": "Reembolsado"
        },
        "payment_statuses": {
            "all": "Todos",
            "pending": "Pendiente",
            "completed": "Completado",
            "failed": "Fallido",
            "refunded": "Reembolsado"
        },
        "update_status": "Actualizar estado",
        "change_status": "Cambiar estado",
        "select_new_status": "Seleccionar nuevo estado",
        "status_updated": "Estado actualizado",
        "export_csv": "Exportar CSV",
        "print_invoice": "Imprimir factura",
        "send_notification": "Enviar notificación",
        "refund_order": "Reembolsar pedido",
        "cancel_order": "Cancelar pedido",
        "confirm_cancel": "Confirmar cancelación",
        "confirm_refund": "Confirmar reembolso",
        "cancel_message": "¿Está seguro de cancelar este pedido?",
        "refund_message": "¿Está seguro de reembolsar este pedido?"
    },
    "products": {
        "title": "Gestión de Productos",
        "subtitle": "Administrar catálogo de productos",
        "all_products": "Todos los productos",
        "add_product": "Añadir producto",
        "edit_product": "Editar producto",
        "delete_product": "Eliminar producto",
        "product_details": "Detalles del producto",
        "basic_info": "Información básica",
        "product_name": "Nombre del producto",
        "type": "Tipo",
        "category": "Categoría",
        "description": "Descripción",
        "pricing": "Precios",
        "price": "Precio",
        "cost_price": "Precio de costo",
        "discount": "Descuento",
        "inventory": "Inventario",
        "stock_quantity": "Cantidad en stock",
        "sku": "SKU",
        "barcode": "Código de barras",
        "track_inventory": "Rastrear inventario",
        "low_stock_threshold": "Umbral de stock bajo",
        "images": "Imágenes",
        "upload_images": "Subir imágenes",
        "main_image": "Imagen principal",
        "gallery": "Galería",
        "settings": "Configuración",
        "is_popular": "Producto popular",
        "is_featured": "Producto destacado",
        "is_active": "Activo",
        "delivery_time": "Tiempo de entrega (días)",
        "warranty": "Garantía (meses)",
        "meta_keywords": "Palabras clave SEO",
        "confirm_delete": "Confirmar eliminación",
        "delete_warning": "Esta acción es irreversible",
        "low_stock": "Stock bajo",
        "out_of_stock": "Sin stock",
        "in_stock": "En stock",
        "views": "Vistas",
        "favorites": "Favoritos",
        "sales": "Ventas",
        "types": {
            "all": "Todos",
            "physical": "Producto físico",
            "gift_card": "Tarjeta regalo"
        },
        "stock_status": {
            "all": "Todos",
            "in_stock": "En stock",
            "low_stock": "Stock bajo",
            "out_of_stock": "Sin stock"
        }
    },
    "gift_cards": {
        "title": "Gestión de Tarjetas Regalo",
        "subtitle": "Administrar tarjetas y códigos",
        "all_codes": "Todos los códigos",
        "generate_codes": "Generar códigos",
        "code": "Código",
        "amount": "Monto",
        "status": "Estado",
        "created_at": "Fecha de creación",
        "expires_at": "Fecha de expiración",
        "used_at": "Fecha de uso",
        "user": "Usuario",
        "statuses": {
            "all": "Todos",
            "pending": "Pendiente",
            "active": "Activo",
            "used": "Usado",
            "expired": "Expirado",
            "cancelled": "Cancelado"
        },
        "generation": {
            "title": "Generar nuevos códigos",
            "amount": "Monto de la tarjeta",
            "quantity": "Cantidad",
            "expiry_days": "Validez (días)",
            "generate": "Generar",
            "generating": "Generando..."
        },
        "actions": {
            "activate": "Activar",
            "cancel": "Cancelar",
            "details": "Detalles",
            "copy": "Copiar código",
            "share": "Compartir"
        },
        "activation": {
            "title": "Activar tarjeta regalo",
            "email": "Correo electrónico",
            "confirm": "Activar",
            "activating": "Activando..."
        },
        "details": {
            "title": "Detalles de la tarjeta",
            "code": "Código",
            "amount": "Monto",
            "status": "Estado",
            "created": "Fecha de creación",
            "expires": "Fecha de expiración",
            "used": "Fecha de uso",
            "user_email": "Correo del usuario"
        },
        "confirm_cancel": "Confirmar cancelación",
        "cancel_message": "¿Está seguro de cancelar este código?",
        "success": {
            "generated": "Códigos generados exitosamente",
            "activated": "Tarjeta activada",
            "cancelled": "Código cancelado",
            "copied": "Copiado",
            "copiedDesc": "Código copiado al portapapeles"
        },
        "errors": {
            "generateError": "Error al generar códigos",
            "activateError": "Error al activar",
            "cancelError": "Error al cancelar",
            "copyError": "Error al copiar",
            "emailRequired": "Se requiere correo electrónico"
        }
    },
    "categories": {
        "title": "Gestión de Categorías",
        "subtitle": "Organizar productos y tarjetas",
        "all_categories": "Todas las categorías",
        "add_category": "Añadir categoría",
        "edit_category": "Editar categoría",
        "delete_category": "Eliminar categoría",
        "category_name": "Nombre de la categoría",
        "description": "Descripción",
        "icon": "Icono",
        "upload_icon": "Subir icono",
        "products_count": "Número de productos",
        "is_active": "Activa",
        "created_at": "Fecha de creación",
        "confirm_delete": "Confirmar eliminación",
        "delete_warning": "Esta categoría será eliminada permanentemente",
        "success": {
            "created": "Categoría creada",
            "updated": "Categoría actualizada",
            "deleted": "Categoría eliminada"
        },
        "errors": {
            "createError": "Error al crear categoría",
            "updateError": "Error al actualizar",
            "deleteError": "Error al eliminar",
            "nameRequired": "El nombre es requerido"
        }
    },
    "delivery": {
        "title": "Gestión de Entregas",
        "subtitle": "Seguimiento de entregas en curso"
    },
    "notifications": {
        "title": "Gestión de Notificaciones",
        "subtitle": "Enviar notificaciones a usuarios"
    },
    "reports": {
        "title": "Informes Financieros",
        "subtitle": "Análisis y estadísticas financieras"
    },
    "audit": {
        "title": "Registros de Auditoría",
        "subtitle": "Historial de acciones administrativas"
    },
    "settings": {
        "title": "Configuración de Admin",
        "subtitle": "Configuración y gestión del sistema Yu Card"
    },
    "wallet": {
        "title": "Gestión de Billetera",
        "adjust_balance": "Ajustar saldo",
        "credit": "Acreditar",
        "debit": "Debitar"
    },
    "stats": {
        "total_revenue": "Ingresos totales",
        "total_orders": "Total de pedidos",
        "total_users": "Total de usuarios",
        "total_products": "Total de productos",
        "total_wallet": "Total de billeteras"
    },
    "messages": {
        "loading": "Cargando...",
        "no_data": "Sin datos",
        "success": "Operación exitosa",
        "error": "Ocurrió un error",
        "confirm_action": "Confirmar acción"
    }
}

# Write updated ES translations
with open('/Users/adelboudalha/Desktop/yu_card/i18n/translations/es.json', 'w', encoding='utf-8') as f:
    json.dump(es_data, f, ensure_ascii=False, indent=2)

print("✅ Traductions ES mises à jour avec succès!")
