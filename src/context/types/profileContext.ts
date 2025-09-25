import { Profile } from "../../types/profile";

export interface ProfileContextType {
  profile: Profile;
  loading: boolean;
  error: unknown;
  reloadProfile: () => void;
}

export interface ProfileProviderProps {
  children: React.ReactNode;
}