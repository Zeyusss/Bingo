
export const DEFAULT_IMAGES = {
  PROFILE: "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756",
  COVER: "https://ik.imagekit.io/w7lwh7wre/cover-handmade.webp?updatedAt=175424311149",
} as const;


export const withDefaultUserAvatar = <T extends { avatar?: string | null }>(user: T): T => {
  return {
    ...user,
    avatar: user.avatar || DEFAULT_IMAGES.PROFILE,
  };
};


export const withDefaultShopImages = <T extends { avatar?: string | null; coverBanner?: string | null }>(shop: T): T => {
  return {
    ...shop,
    avatar: shop.avatar || DEFAULT_IMAGES.PROFILE,
    coverBanner: shop.coverBanner || DEFAULT_IMAGES.COVER,
  };
};


export const withDefaultUserAvatars = <T extends { avatar?: string | null }>(users: T[]): T[] => {
  return users.map(withDefaultUserAvatar);
};


export const withDefaultShopImagesArray = <T extends { avatar?: string | null; coverBanner?: string | null }>(shops: T[]): T[] => {
  return shops.map(withDefaultShopImages);
};


export const withDefaultNestedUserAvatar = <T extends { user?: { avatar?: string | null } | null }>(obj: T): T => {
  if (!obj.user) return obj;
  
  return {
    ...obj,
    user: withDefaultUserAvatar(obj.user),
  };
};


export const withDefaultNestedShopImages = <T extends { shop?: { avatar?: string | null; coverBanner?: string | null } | null }>(obj: T): T => {
  if (!obj.shop) return obj;
  
  return {
    ...obj,
    shop: withDefaultShopImages(obj.shop),
  };
};
