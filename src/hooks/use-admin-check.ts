import { ADMIN_ADDRESSES, SUPER_ADMIN_ADDRESSES } from '@/config';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

export const useAdminCheck = () => {
  const {user} = usePrivy();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const _isAdmin = user?.wallet?.address ? ADMIN_ADDRESSES.includes(user.wallet.address) : false;
  const _isSuperAdmin = user?.wallet?.address ? SUPER_ADMIN_ADDRESSES.includes(user.wallet.address) : false;

  useEffect(() => {
    setIsAdmin(_isAdmin);
    setIsSuperAdmin(_isSuperAdmin);
    setIsLoading(false);
  }, [_isAdmin, _isSuperAdmin]);

  return {
    isAdmin,  
    isSuperAdmin,
    user,
    isLoading,
  }
} 