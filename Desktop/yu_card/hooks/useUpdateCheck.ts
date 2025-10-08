import { UpdateInfo, UpdateService } from '@/services/updateService';
import { useEffect, useRef, useState } from 'react';

export const useUpdateCheck = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({ isUpdateAvailable: false });
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const hasCheckedOnStartup = useRef(false);

  // Vérifier les mises à jour au démarrage (une seule fois)
  useEffect(() => {
    if (hasCheckedOnStartup.current) return;
    
    const checkForUpdatesOnStartup = async () => {
      try {
        setIsChecking(true);
        const info = await UpdateService.checkForUpdateSilently();
        
        setUpdateInfo(info);
        
        // Afficher la modal seulement si une mise à jour est disponible
        if (info.isUpdateAvailable) {
          // Délai de 2 secondes pour laisser l'app se charger complètement
          setTimeout(() => {
            setShowModal(true);
          }, 2000);
        }
        
        hasCheckedOnStartup.current = true;
      } catch (error) {
        console.warn('Erreur lors de la vérification des mises à jour au démarrage:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkForUpdatesOnStartup();
  }, []);

  // Vérification manuelle
  const checkForUpdates = async () => {
    try {
      setIsChecking(true);
      const info = await UpdateService.checkForUpdate();
      setUpdateInfo(info);
      
      if (info.isUpdateAvailable) {
        setShowModal(true);
      }
      
      return info;
    } catch (error) {
      console.warn('Erreur lors de la vérification manuelle des mises à jour:', error);
      return { isUpdateAvailable: false };
    } finally {
      setIsChecking(false);
    }
  };

  const hideModal = () => {
    setShowModal(false);
  };

  return {
    updateInfo,
    showModal,
    isChecking,
    checkForUpdates,
    hideModal,
  };
};