import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAdminId = () => {
  const [adminId, setAdminId] = useState<string>('');

  useEffect(() => {
    const loadAdminId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');

        console.log('📦 USER ID FROM STORAGE:', id);

        setAdminId(id ?? '');
      } catch (error) {
        console.log('❌ ERROR GETTING USER ID:', error);
        setAdminId('');
      }
    };

    loadAdminId();
  }, []);

  return adminId;
};
