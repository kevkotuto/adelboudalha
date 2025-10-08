/**
 * ProductFormModal Component
 * Complete CRUD form for products and gift cards with image upload
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ImageUploader } from './ImageUploader';
import { CategoryPickerModal } from './CategoryPickerModal';
import { Button } from '@/components/ui/Buttons/Button';
import { NumberInput } from '@/components/ui/Inputs/NumberInput';
import { TextInput } from '@/components/ui/Inputs/TextInput';
import { TextArea } from '@/components/ui/Inputs/TextArea';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import type { AdminGiftCard, AdminProduct } from '@/types/admin';
import { uploadService } from '@/services/uploadService';
import type { FileUpload } from '@/types';

type ProductType = 'product' | 'gift_card';

interface ProductFormData {
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  price: string;
  originalPrice: string;
  stockQuantity: string;
  sku: string;
  images: string[];
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  // Product specific
  weightKg?: string;
  dimensionLength?: string;
  dimensionWidth?: string;
  dimensionHeight?: string;
  deliveryTimeDays?: string;
  warrantyMonths?: string;
  // Gift card specific
  minAmount?: string;
  maxAmount?: string;
  fixedAmounts?: string; // Comma-separated values: "5000,10000,25000,50000"
  validityDays?: string;
  termsConditions?: string;
  usageInstructions?: string;
}

interface ProductFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any, type: ProductType) => Promise<void>;
  type: ProductType;
  editData?: (AdminProduct | AdminGiftCard) & { type: ProductType };
  categories: Array<{ id: string; name: string }>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  type,
  editData,
  categories,
}) => {
  const isEditing = !!editData;
  const isGiftCard = type === 'gift_card';

  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    brand: '',
    categoryId: '',
    description: '',
    price: '',
    originalPrice: '',
    stockQuantity: '0',
    sku: '',
    images: [],
    isPopular: false,
    isFeatured: false,
    isActive: true,
    // Product specific
    weightKg: '',
    dimensionLength: '',
    dimensionWidth: '',
    dimensionHeight: '',
    deliveryTimeDays: '3',
    warrantyMonths: '12',
    // Gift card specific
    minAmount: '',
    maxAmount: '',
    fixedAmounts: '',
    validityDays: '365',
    termsConditions: '',
    usageInstructions: '',
  });

  // Load edit data
  useEffect(() => {
    if (editData) {
      const data = editData as any;

      // Helper pour convertir les prix (string ou number) en string
      // IMPORTANT: Ne pas retourner '' pour 0, car 0 est une valeur valide
      // Les valeurs sont utilisées telles quelles depuis la DB (pas de division par 100)
      const parsePrice = (value: any): string => {
        // Gérer null, undefined, et chaîne vide
        if (value === null || value === undefined || value === '') return '';

        // Convertir string en number si nécessaire
        const numValue = typeof value === 'string' ? parseFloat(value) : value;

        // Vérifier si c'est un nombre valide (y compris 0)
        if (isNaN(numValue)) return '';

        // Convertir en string - valeur directe depuis la DB
        return String(numValue);
      };

      // Récupération des prix directs depuis la DB (pas de division)
      // Ne pas utiliser || car 0 est falsy mais valide
      const rawPrice = data.price !== undefined ? data.price : (data.fixedAmounts?.[0] !== undefined ? data.fixedAmounts[0] : '');
      const rawOriginalPrice = data.originalPrice !== undefined ? data.originalPrice : '';
      const rawMinAmount = data.minAmount !== undefined ? data.minAmount : '';
      const rawMaxAmount = data.maxAmount !== undefined ? data.maxAmount : '';

      console.log('[ProductFormModal] Loading edit data:', {
        rawPrice,
        rawOriginalPrice,
        rawMinAmount,
        rawMaxAmount,
        priceType: typeof rawPrice,
        originalPriceType: typeof rawOriginalPrice,
        minAmountType: typeof rawMinAmount,
        maxAmountType: typeof rawMaxAmount,
        parsedPrice: parsePrice(rawPrice),
        parsedOriginalPrice: parsePrice(rawOriginalPrice),
        parsedMinAmount: parsePrice(rawMinAmount),
        parsedMaxAmount: parsePrice(rawMaxAmount),
        hasFixedAmounts: !!data.fixedAmounts,
        fixedAmounts: data.fixedAmounts,
        stockQuantity: data.stockQuantity,
        fullDataKeys: Object.keys(data),
      });

      // Convertir fixedAmounts (array de numbers) en string séparée par virgules pour l'affichage
      const fixedAmountsString = data.fixedAmounts && Array.isArray(data.fixedAmounts)
        ? data.fixedAmounts.map((amt: number) => String(amt)).join(', ')
        : '';

      setFormData({
        name: data.name || data.title || '',
        brand: data.brand || data.merchantName || '',
        categoryId: data.categoryId || (data.category?.id) || '',
        description: data.description || '',
        price: parsePrice(rawPrice),
        originalPrice: parsePrice(rawOriginalPrice),
        stockQuantity: String(data.stockQuantity !== undefined && data.stockQuantity !== null ? data.stockQuantity : 0),
        sku: data.sku || '',
        images: data.images || [data.mainImageUrl, data.imageUrl].filter(Boolean) || [],
        isPopular: data.isPopular || false,
        isFeatured: data.isFeatured || false,
        isActive: data.isActive ?? true,
        // Product specific
        weightKg: data.weightKg ? String(data.weightKg) : '',
        dimensionLength: data.dimensionsCm?.length ? String(data.dimensionsCm.length) : '',
        dimensionWidth: data.dimensionsCm?.width ? String(data.dimensionsCm.width) : '',
        dimensionHeight: data.dimensionsCm?.height ? String(data.dimensionsCm.height) : '',
        deliveryTimeDays: data.deliveryTimeDays ? String(data.deliveryTimeDays) : '3',
        warrantyMonths: data.warrantyMonths ? String(data.warrantyMonths) : '12',
        // Gift card specific
        minAmount: parsePrice(rawMinAmount),
        maxAmount: parsePrice(rawMaxAmount),
        fixedAmounts: fixedAmountsString,
        validityDays: String(data.validityDays || 365),
        termsConditions: data.termsConditions || '',
        usageInstructions: data.usageInstructions || '',
      });
    } else {
      // Reset form for new creation
      setFormData({
        name: '',
        brand: '',
        categoryId: '',
        description: '',
        price: '',
        originalPrice: '',
        stockQuantity: '0',
        sku: '',
        images: [],
        isPopular: false,
        isFeatured: false,
        isActive: true,
        // Product specific
        weightKg: '',
        dimensionLength: '',
        dimensionWidth: '',
        dimensionHeight: '',
        deliveryTimeDays: '3',
        warrantyMonths: '12',
        // Gift card specific
        minAmount: '',
        maxAmount: '',
        fixedAmounts: '',
        validityDays: '365',
        termsConditions: '',
        usageInstructions: '',
      });
    }
  }, [editData, visible]);

  const updateField = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return false;
    }

    if (!formData.categoryId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return false;
    }

    // Validation du prix selon le type
    if (isGiftCard) {
      // Pour les gift cards: soit fixedAmounts, soit min/max, soit price
      const hasFixedAmounts = formData.fixedAmounts?.trim();
      const hasMinMax = formData.minAmount && formData.maxAmount;
      const hasPrice = formData.price;

      if (!hasFixedAmounts && !hasMinMax && !hasPrice) {
        Alert.alert(
          'Erreur',
          'Veuillez définir au moins une option de tarification:\n• Montants fixes\n• Plage min/max\n• Prix unique'
        );
        return false;
      }

      // Valider que min < max si les deux sont renseignés
      if (hasMinMax && parseFloat(formData.minAmount!) >= parseFloat(formData.maxAmount!)) {
        Alert.alert('Erreur', 'Le montant minimum doit être inférieur au maximum');
        return false;
      }
    } else {
      // Pour les produits physiques: prix obligatoire
      if (!formData.price) {
        Alert.alert('Erreur', 'Le prix est requis');
        return false;
      }
    }

    if (!isGiftCard && !formData.sku) {
      Alert.alert('Erreur', 'Le SKU est requis pour les produits');
      return false;
    }

    if (formData.images.length === 0) {
      Alert.alert('Erreur', 'Au moins une image est requise');
      return false;
    }

    return true;
  };

  // Fonction pour uploader les images locales
  const uploadLocalImages = async (imageUris: string[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const localImages = imageUris.filter(uri =>
      uri.startsWith('file://') ||
      uri.startsWith('/data/') ||
      uri.startsWith('content://')
    );

    // Les images déjà uploadées (URLs serveur)
    const serverImages = imageUris.filter(uri =>
      uri.startsWith('http://') || uri.startsWith('https://')
    );

    console.log('[ProductFormModal] Images à uploader:', {
      total: imageUris.length,
      local: localImages.length,
      server: serverImages.length,
    });

    // Upload des images locales
    for (const uri of localImages) {
      try {
        const file: FileUpload = {
          uri,
          type: 'image/jpeg',
          name: `product_${Date.now()}.jpg`,
        };

        const response = isGiftCard
          ? await uploadService.uploadGiftCardImages([file])
          : await uploadService.uploadProductImages([file]);

        console.log('[ProductFormModal] 📦 Upload response:', JSON.stringify(response, null, 2));

        // Vérifier le format de la réponse
        if (response && typeof response === 'object') {
          // Format backend: { images: [{ url, ... }], count, uploadedBy, uploadedAt }
          if ('images' in response && Array.isArray(response.images) && response.images.length > 0) {
            uploadedUrls.push(response.images[0].url);
            console.log('[ProductFormModal] ✅ Image uploadée (backend format):', response.images[0].url);
          }
          // Si c'est UploadMultipleResponse avec array files
          else if ('files' in response && Array.isArray(response.files) && response.files.length > 0) {
            uploadedUrls.push(response.files[0].url);
            console.log('[ProductFormModal] ✅ Image uploadée (files array):', response.files[0].url);
          }
          // Si c'est UploadResponse direct (single file)
          else if ('url' in response && response.url) {
            uploadedUrls.push(response.url);
            console.log('[ProductFormModal] ✅ Image uploadée (direct):', response.url);
          }
          // Si c'est un array direct de URLs
          else if (Array.isArray(response) && response.length > 0 && response[0].url) {
            uploadedUrls.push(response[0].url);
            console.log('[ProductFormModal] ✅ Image uploadée (response array):', response[0].url);
          }
          else {
            console.error('[ProductFormModal] ❌ Format de réponse inattendu:', response);
          }
        }
      } catch (error: any) {
        console.error('[ProductFormModal] ❌ Erreur upload image:', error);
        throw new Error(`Impossible d'uploader l'image: ${error.message || 'Erreur inconnue'}`);
      }
    }

    // Retourner toutes les URLs (serveur + nouvellement uploadées)
    return [...serverImages, ...uploadedUrls];
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 1. Uploader d'abord les images locales
      console.log('[ProductFormModal] 📤 Upload des images...');
      const uploadedImageUrls = await uploadLocalImages(formData.images);
      console.log('[ProductFormModal] ✅ Toutes les images uploadées:', uploadedImageUrls);
      // 2. Préparer les données avec les URLs uploadées
      const submitData = isGiftCard
        ? {
            title: formData.name,
            brand: formData.brand, // API utilise "brand", pas "merchantName"
            categoryId: formData.categoryId,
            description: formData.description,
            termsConditions: formData.termsConditions || '',
            usageInstructions: formData.usageInstructions || '',
            imageUrl: uploadedImageUrls[0], // Image principale
            // Montants: si fixedAmounts est renseigné, l'utiliser, sinon utiliser price et min/max
            ...(formData.fixedAmounts?.trim()
              ? {
                  // Parse les montants fixes séparés par virgule
                  fixedAmounts: formData.fixedAmounts
                    .split(',')
                    .map(amt => Math.round(parseFloat(amt.trim())))
                    .filter(amt => !isNaN(amt) && amt > 0),
                }
              : {
                  // Fallback sur price unique ou plage min/max
                  minAmount: parseInt(formData.minAmount || formData.price || '0'),
                  maxAmount: parseInt(formData.maxAmount || formData.price || '0'),
                  fixedAmounts: formData.price ? [parseInt(formData.price)] : [],
                }),
            validityDays: parseInt(formData.validityDays || '365'),
            isPopular: formData.isPopular,
            isFeatured: formData.isFeatured,
            isActive: formData.isActive,
          }
        : {
            name: formData.name,
            brand: formData.brand,
            categoryId: formData.categoryId,
            description: formData.description,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
            stockQuantity: parseInt(formData.stockQuantity),
            sku: formData.sku,
            images: uploadedImageUrls, // URLs uploadées
            weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
            dimensionsCm:
              formData.dimensionLength || formData.dimensionWidth || formData.dimensionHeight
                ? {
                    length: formData.dimensionLength ? parseFloat(formData.dimensionLength) : 0,
                    width: formData.dimensionWidth ? parseFloat(formData.dimensionWidth) : 0,
                    height: formData.dimensionHeight ? parseFloat(formData.dimensionHeight) : 0,
                  }
                : undefined,
            deliveryTimeDays: formData.deliveryTimeDays ? parseInt(formData.deliveryTimeDays) : 3,
            warrantyMonths: formData.warrantyMonths ? parseInt(formData.warrantyMonths) : 12,
            isPopular: formData.isPopular,
            isFeatured: formData.isFeatured,
            isActive: formData.isActive,
          };

      await onSubmit(submitData, type);
      onClose();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de sauvegarder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Title level={3}>
                {isEditing ? 'Modifier' : 'Créer'} {isGiftCard ? 'Gift Card' : 'Produit'}
              </Title>
              <Caption style={styles.headerSubtitle}>
                {isEditing ? 'Mettez à jour les informations' : 'Remplissez tous les champs'}
              </Caption>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </Pressable>
          </View>

          {/* Form */}
          <ScrollView
            style={styles.form}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Images */}
            <ImageUploader
              images={formData.images}
              onImagesChange={(images) => updateField('images', images)}
              maxImages={5}
              type={isGiftCard ? 'gift_card' : 'product'}
            />

            {/* Name */}
            <TextInput
              label={isGiftCard ? 'Titre' : 'Nom du produit'}
              placeholder={isGiftCard ? 'Ex: Carte Cadeau Amazon' : 'Ex: iPhone 15 Pro Max'}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              required
            />

            {/* Brand */}
            <TextInput
              label={isGiftCard ? 'Marchand' : 'Marque'}
              placeholder={isGiftCard ? 'Ex: Amazon' : 'Ex: Apple'}
              value={formData.brand}
              onChangeText={(value) => updateField('brand', value)}
              required
            />

            {/* Category Picker */}
            <View style={styles.field}>
              <Paragraph style={styles.fieldLabel}>
                Catégorie <Caption style={styles.required}>*</Caption>
              </Paragraph>
              <Pressable
                style={[
                  styles.categoryPickerButton,
                  formData.categoryId && styles.categoryPickerButtonActive,
                ]}
                onPress={() => setShowCategoryPicker(true)}
              >
                <View style={styles.categoryPickerContent}>
                  <Ionicons
                    name={formData.categoryId ? 'checkmark-circle' : 'grid-outline'}
                    size={20}
                    color={formData.categoryId ? Colors.primary : Colors.text.secondary}
                  />
                  <Paragraph
                    style={[
                      styles.categoryPickerText,
                      formData.categoryId && styles.categoryPickerTextActive,
                    ]}
                  >
                    {formData.categoryId
                      ? categories.find(c => c.id === formData.categoryId)?.name || 'Sélectionner'
                      : 'Sélectionner une catégorie'}
                  </Paragraph>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.text.secondary}
                />
              </Pressable>
            </View>

            {/* Description */}
            <TextArea
              label="Description"
              placeholder="Décrivez le produit en détail..."
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              minHeight={100}
              maxHeight={200}
              showCharCount
              icon="document-text-outline"
              hint="Une description claire et détaillée aide à la vente"
            />

            {/* Price Section */}
            <View style={styles.priceSection}>
              <Title level={6} style={styles.sectionTitle}>
                <Ionicons name="cash-outline" size={16} color={Colors.primary} /> Tarification
              </Title>

              {/* Prix de vente - Requis pour produits, optionnel pour gift cards */}
              <NumberInput
                label={isGiftCard ? "Prix unique (optionnel)" : "Prix de vente"}
                placeholder="10000"
                value={formData.price}
                onChangeText={(value) => updateField('price', value)}
                required={!isGiftCard}
                suffix="FCFA"
                keyboardType="numeric"
                icon="cash"
                hint={isGiftCard ? "Si non renseigné, utilisez montants fixes ou min/max ci-dessous" : undefined}
              />

              {!isGiftCard && (
                <NumberInput
                  label="Prix barré (optionnel)"
                  placeholder="12000"
                  value={formData.originalPrice}
                  onChangeText={(value) => updateField('originalPrice', value)}
                  suffix="FCFA"
                  keyboardType="numeric"
                  icon="pricetag-outline"
                />
              )}

              {/* Discount Badge - Uniquement pour les produits */}
              {!isGiftCard && formData.price && formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.price) && (
                <View style={styles.discountBadge}>
                  <Ionicons name="trending-down" size={14} color="#4CAF50" />
                  <Caption style={styles.discountText}>
                    Réduction de {Math.round((1 - parseFloat(formData.price) / parseFloat(formData.originalPrice)) * 100)}%
                  </Caption>
                </View>
              )}
            </View>

            {/* Gift Card Specific */}
            {isGiftCard && (
              <>
                <View style={styles.priceSection}>
                  <Title level={6} style={styles.sectionTitle}>
                    <Ionicons name="gift-outline" size={16} color={Colors.primary} /> Montants disponibles
                  </Title>
                  <Caption style={styles.sectionHint}>
                    Définissez les montants prédéfinis ou une plage de montants
                  </Caption>

                  {/* Montants fixes (prédéfinis) */}
                  <TextInput
                    label="Montants fixes (optionnel)"
                    placeholder="5000, 10000, 25000, 50000"
                    value={formData.fixedAmounts}
                    onChangeText={(value) => updateField('fixedAmounts', value)}
                    icon="pricetags-outline"
                    hint="Séparez les montants par une virgule (ex: 5000, 10000, 25000)"
                  />

                  {/* Preview des montants */}
                  {formData.fixedAmounts?.trim() && (
                    <View style={styles.fixedAmountsPreview}>
                      <Caption style={styles.previewLabel}>Aperçu des montants :</Caption>
                      <View style={styles.amountsRow}>
                        {formData.fixedAmounts.split(',').map((amt, idx) => {
                          const amount = parseFloat(amt.trim());
                          if (isNaN(amount) || amount <= 0) return null;
                          return (
                            <View key={idx} style={styles.amountChip}>
                              <Caption style={styles.amountChipText}>
                                {amount.toLocaleString('fr-FR')} FCFA
                              </Caption>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* OU Séparateur */}
                  {formData.fixedAmounts?.trim() && (
                    <View style={styles.orDivider}>
                      <View style={styles.orLine} />
                      <Caption style={styles.orText}>OU</Caption>
                      <View style={styles.orLine} />
                    </View>
                  )}

                  {/* Plage de montants (si pas de montants fixes) */}
                  <View style={styles.row}>
                    <NumberInput
                      label="Montant minimum"
                      placeholder="1000"
                      value={formData.minAmount}
                      onChangeText={(value) => updateField('minAmount', value)}
                      style={styles.halfField}
                      suffix="FCFA"
                      keyboardType="numeric"
                      icon="remove-circle-outline"
                      hint={formData.fixedAmounts?.trim() ? "Ignoré si montants fixes définis" : ""}
                    />
                    <NumberInput
                      label="Montant maximum"
                      placeholder="100000"
                      value={formData.maxAmount}
                      onChangeText={(value) => updateField('maxAmount', value)}
                      style={styles.halfField}
                      suffix="FCFA"
                      keyboardType="numeric"
                      icon="add-circle-outline"
                      hint={formData.fixedAmounts?.trim() ? "Ignoré si montants fixes définis" : ""}
                    />
                  </View>

                  <NumberInput
                    label="Validité de la carte"
                    placeholder="365"
                    value={formData.validityDays}
                    onChangeText={(value) => updateField('validityDays', value)}
                    suffix="jours"
                    keyboardType="numeric"
                    icon="calendar-outline"
                  />
                </View>

                {/* Conditions & Instructions */}
                <View style={styles.priceSection}>
                  <Title level={6} style={styles.sectionTitle}>
                    <Ionicons name="document-text-outline" size={16} color={Colors.primary} /> Conditions & Instructions
                  </Title>
                  <Caption style={styles.sectionHint}>
                    Informations importantes pour l'utilisation de la carte cadeau
                  </Caption>

                  <TextArea
                    label="Conditions d'utilisation"
                    placeholder="Ex: Valable uniquement en ligne, non remboursable, expire après 1 an..."
                    value={formData.termsConditions}
                    onChangeText={(value) => updateField('termsConditions', value)}
                    minHeight={80}
                    maxHeight={150}
                    showCharCount
                    icon="shield-checkmark-outline"
                  />

                  <TextArea
                    label="Instructions d'utilisation"
                    placeholder="Ex: 1. Ajoutez le code lors du paiement
2. Le montant sera déduit automatiquement
3. Valable sur tous les produits..."
                    value={formData.usageInstructions}
                    onChangeText={(value) => updateField('usageInstructions', value)}
                    minHeight={80}
                    maxHeight={150}
                    showCharCount
                    icon="information-circle-outline"
                  />
                </View>
              </>
            )}

            {/* Product Specific */}
            {!isGiftCard && (
              <>
                <View style={styles.priceSection}>
                  <Title level={6} style={styles.sectionTitle}>
                    <Ionicons name="cube-outline" size={16} color={Colors.primary} /> Inventaire
                  </Title>

                  <View style={styles.row}>
                    <View style={styles.halfField}>
                      <NumberInput
                        label="Quantité en stock"
                        placeholder="0"
                        value={formData.stockQuantity}
                        onChangeText={(value) => updateField('stockQuantity', value)}
                        required
                        keyboardType="numeric"
                        icon="cube"
                      />
                      {/* Stock Status Indicator */}
                      {formData.stockQuantity && (
                        <View style={styles.stockIndicator}>
                          <Ionicons
                            name={parseInt(formData.stockQuantity) === 0 ? 'close-circle' : parseInt(formData.stockQuantity) < 5 ? 'warning' : 'checkmark-circle'}
                            size={14}
                            color={parseInt(formData.stockQuantity) === 0 ? '#f44336' : parseInt(formData.stockQuantity) < 5 ? '#FF9800' : '#4CAF50'}
                          />
                          <Caption style={[styles.stockText, { color: parseInt(formData.stockQuantity) === 0 ? '#f44336' : parseInt(formData.stockQuantity) < 5 ? '#FF9800' : '#4CAF50' }]}>
                            {parseInt(formData.stockQuantity) === 0 ? 'Rupture de stock' : parseInt(formData.stockQuantity) < 5 ? 'Stock faible' : 'Stock disponible'}
                          </Caption>
                        </View>
                      )}
                    </View>

                    <TextInput
                      label="Code SKU"
                      placeholder="PROD-001"
                      value={formData.sku}
                      onChangeText={(value) => updateField('sku', value.toUpperCase())}
                      style={styles.halfField}
                      required
                      autoCapitalize="characters"
                      icon="barcode-outline"
                    />
                  </View>
                </View>

                {/* Caractéristiques physiques */}
                <View style={styles.priceSection}>
                  <Title level={6} style={styles.sectionTitle}>
                    <Ionicons name="resize-outline" size={16} color={Colors.primary} /> Caractéristiques physiques
                  </Title>
                  <Caption style={styles.sectionHint}>
                    Informations sur le poids et les dimensions du produit
                  </Caption>

                  <NumberInput
                    label="Poids (kg)"
                    placeholder="0.5"
                    value={formData.weightKg}
                    onChangeText={(value) => updateField('weightKg', value)}
                    suffix="kg"
                    keyboardType="decimal-pad"
                    icon="scale-outline"
                  />

                  <View style={styles.row}>
                    <NumberInput
                      label="Longueur (cm)"
                      placeholder="10"
                      value={formData.dimensionLength}
                      onChangeText={(value) => updateField('dimensionLength', value)}
                      style={[styles.halfField, { marginRight: Spacing.xs }]}
                      suffix="cm"
                      keyboardType="decimal-pad"
                    />
                    <NumberInput
                      label="Largeur (cm)"
                      placeholder="5"
                      value={formData.dimensionWidth}
                      onChangeText={(value) => updateField('dimensionWidth', value)}
                      style={[styles.halfField, { marginRight: Spacing.xs }]}
                      suffix="cm"
                      keyboardType="decimal-pad"
                    />
                    <NumberInput
                      label="Hauteur (cm)"
                      placeholder="2"
                      value={formData.dimensionHeight}
                      onChangeText={(value) => updateField('dimensionHeight', value)}
                      style={styles.halfField}
                      suffix="cm"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                {/* Livraison & Garantie */}
                <View style={styles.priceSection}>
                  <Title level={6} style={styles.sectionTitle}>
                    <Ionicons name="settings-outline" size={16} color={Colors.primary} /> Livraison & Garantie
                  </Title>

                  <View style={styles.row}>
                    <NumberInput
                      label="Délai de livraison"
                      placeholder="3"
                      value={formData.deliveryTimeDays}
                      onChangeText={(value) => updateField('deliveryTimeDays', value)}
                      style={styles.halfField}
                      suffix="jours"
                      keyboardType="numeric"
                      icon="time-outline"
                    />
                    <NumberInput
                      label="Garantie"
                      placeholder="12"
                      value={formData.warrantyMonths}
                      onChangeText={(value) => updateField('warrantyMonths', value)}
                      style={styles.halfField}
                      suffix="mois"
                      keyboardType="numeric"
                      icon="shield-checkmark-outline"
                    />
                  </View>
                </View>
              </>
            )}

            {/* Toggles */}
            <View style={styles.togglesSection}>
              <Title level={6} style={styles.togglesTitle}>Options</Title>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Paragraph style={styles.toggleLabel}>Actif</Paragraph>
                  <Caption style={styles.toggleHint}>
                    Afficher sur l'application
                  </Caption>
                </View>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => updateField('isActive', value)}
                  trackColor={{ false: '#ccc', true: Colors.primary + '80' }}
                  thumbColor={formData.isActive ? Colors.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Paragraph style={styles.toggleLabel}>Populaire</Paragraph>
                  <Caption style={styles.toggleHint}>
                    Afficher dans les populaires
                  </Caption>
                </View>
                <Switch
                  value={formData.isPopular}
                  onValueChange={(value) => updateField('isPopular', value)}
                  trackColor={{ false: '#ccc', true: Colors.primary + '80' }}
                  thumbColor={formData.isPopular ? Colors.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Paragraph style={styles.toggleLabel}>En vedette</Paragraph>
                  <Caption style={styles.toggleHint}>
                    Afficher dans les suggestions
                  </Caption>
                </View>
                <Switch
                  value={formData.isFeatured}
                  onValueChange={(value) => updateField('isFeatured', value)}
                  trackColor={{ false: '#ccc', true: Colors.primary + '80' }}
                  thumbColor={formData.isFeatured ? Colors.primary : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              variant="outline"
              onPress={onClose}
              style={styles.footerButton}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.footerButton}
            >
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </View>
        </KeyboardAvoidingView>

        {/* Category Picker Modal */}
        <CategoryPickerModal
          visible={showCategoryPicker}
          onClose={() => setShowCategoryPicker(false)}
          onSelect={(categoryId) => updateField('categoryId', categoryId)}
          categories={categories}
          selectedCategoryId={formData.categoryId}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  flex: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  headerSubtitle: {
    marginTop: Spacing.xs,
    color: Colors.text.secondary,
  },

  closeButton: {
    padding: Spacing.xs,
  },

  form: {
    flex: 1,
  },

  formContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },

  field: {
    marginBottom: Spacing.md,
  },

  fieldLabel: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  required: {
    color: '#f44336',
  },

  categoryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },

  categoryPickerButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },

  categoryPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },

  categoryPickerText: {
    fontSize: 15,
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
  },

  categoryPickerTextActive: {
    fontFamily: 'Ubuntu_500Medium',
    color: Colors.primary,
  },

  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },

  halfField: {
    flex: 1,
  },

  togglesSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  togglesTitle: {
    fontFamily: 'Ubuntu_600SemiBold',
    marginBottom: Spacing.md,
  },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  toggleInfo: {
    flex: 1,
  },

  toggleLabel: {
    fontFamily: 'Ubuntu_500Medium',
    color: Colors.text.primary,
  },

  toggleHint: {
    marginTop: 2,
    color: Colors.text.secondary,
    fontSize: 11,
  },

  priceSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  sectionTitle: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionHint: {
    color: Colors.text.secondary,
    fontSize: 11,
    marginBottom: Spacing.md,
    lineHeight: 16,
  },

  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4CAF5010',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
  },

  discountText: {
    color: '#4CAF50',
    fontFamily: 'Ubuntu_600SemiBold',
    fontSize: 11,
  },

  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },

  stockText: {
    fontFamily: 'Ubuntu_500Medium',
    fontSize: 11,
  },

  bottomSpacing: {
    height: Spacing.xl,
  },

  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    backgroundColor: Colors.white,
  },

  footerButton: {
    flex: 1,
  },

  fixedAmountsPreview: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  previewLabel: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    fontSize: 11,
  },

  amountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  amountChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },

  amountChipText: {
    color: Colors.white,
    fontFamily: 'Ubuntu_600SemiBold',
    fontSize: 12,
  },

  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },

  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.primary,
  },

  orText: {
    marginHorizontal: Spacing.md,
    color: Colors.text.secondary,
    fontFamily: 'Ubuntu_600SemiBold',
    fontSize: 11,
  },
});
