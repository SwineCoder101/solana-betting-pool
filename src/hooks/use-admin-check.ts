import { ADMIN_ADDRESSES, SUPER_ADMIN_ADDRESSES } from '@/config';
import { usePrivy } from '@privy-io/react-auth';

export const useAdminCheck = () => {
  const {user} = usePrivy();

  const isAdmin = user?.wallet?.address ? ADMIN_ADDRESSES.includes(user.wallet.address) : false;
  const isSuperAdmin = user?.wallet?.address ? SUPER_ADMIN_ADDRESSES.includes(user.wallet.address) : false;

  return {
    isAdmin,  
    isSuperAdmin,
    user,
  }
} 