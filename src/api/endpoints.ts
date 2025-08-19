export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verify: '/auth/verify',
    refreshToken: '/auth/refresh',
  },
  user: {
    profile: '/user/profile',
    updateProfile: '/user/profile/update',
    photos: '/user/photos',
    settings: '/user/settings',
  },
  matches: {
    list: '/matches',
    like: (userId: string) => `/matches/like/${userId}`,
    unlike: (userId: string) => `/matches/unlike/${userId}`,
    block: (userId: string) => `/matches/block/${userId}`,
  },
  chat: {
    messages: (matchId: string) => `/chat/${matchId}/messages`,
    send: (matchId: string) => `/chat/${matchId}/send`,
  },
  subscription: {
    plans: '/subscription/plans',
    purchase: '/subscription/purchase',
    cancel: '/subscription/cancel',
  },
};
