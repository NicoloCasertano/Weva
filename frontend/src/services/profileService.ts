import AsyncStorage from '@react-native-async-storage/async-storage';
import { type FreelancerProfile, emptyProfile } from '@weva/shared';

const KEY = 'weva_profile';

export async function getProfile(): Promise<FreelancerProfile> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return emptyProfile;
  return { ...emptyProfile, ...JSON.parse(raw) };
}

export async function saveProfile(profile: FreelancerProfile): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}
