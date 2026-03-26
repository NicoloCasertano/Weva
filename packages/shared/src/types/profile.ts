export interface FreelancerProfile {
  name: string;
  vatNumber: string;
  email: string;
  phone: string;
  address: string;
}

export const emptyProfile: FreelancerProfile = {
  name: '',
  vatNumber: '',
  email: '',
  phone: '',
  address: '',
};
