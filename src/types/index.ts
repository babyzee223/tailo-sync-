// Update the AlterationStatus type to include 'archived'
export type AlterationStatus = 'pending' | 'in-progress' | 'completed' | 'archived';

export type User = {
  id: string;
  username: string;
  name: string;
  role: string;
  password: string;
};

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isSubscriptionActive: boolean;
  checkSubscription: (userId: string) => Promise<boolean>;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: 'fabric' | 'notions' | 'supplies';
  description: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  price: number;
  location: string;
  supplier: string;
  lastRestocked: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
};