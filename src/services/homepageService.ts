import { settingsService } from '@/services/settingsService';
import {
  HomepageAnnouncement,
  HomepageCategoryPill,
  HomepagePopup,
  HomepagePressItem,
  HomepageBundleCard,
  HomepageNoteProfile,
  HomepageRetailPartner,
  HomepagePromise,
  HomepageInstagramPost,
  HomepageTitles,
} from '@/lib/types';
import {
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_CATEGORY_PILLS,
  DEFAULT_POPUP,
  DEFAULT_PRESS,
  DEFAULT_BUNDLES,
  DEFAULT_NOTE_PROFILES,
  DEFAULT_RETAIL_PARTNERS,
  DEFAULT_PROMISES,
  DEFAULT_INSTAGRAM,
  DEFAULT_TITLES,
} from '@/lib/homepageDefaults';

export {
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_CATEGORY_PILLS,
  DEFAULT_POPUP,
  DEFAULT_PRESS,
  DEFAULT_BUNDLES,
  DEFAULT_NOTE_PROFILES,
  DEFAULT_RETAIL_PARTNERS,
  DEFAULT_PROMISES,
  DEFAULT_INSTAGRAM,
  DEFAULT_TITLES,
};

export const homepageService = {
  getAnnouncements: () =>
    settingsService.get<HomepageAnnouncement[]>('homepage_announcements', DEFAULT_ANNOUNCEMENTS),
  setAnnouncements: (val: HomepageAnnouncement[]) =>
    settingsService.set('homepage_announcements', val),

  getCategoryPills: () =>
    settingsService.get<HomepageCategoryPill[]>('homepage_category_pills', DEFAULT_CATEGORY_PILLS),
  setCategoryPills: (val: HomepageCategoryPill[]) =>
    settingsService.set('homepage_category_pills', val),

  getPopup: () =>
    settingsService.get<HomepagePopup>('homepage_popup', DEFAULT_POPUP),
  setPopup: (val: HomepagePopup) =>
    settingsService.set('homepage_popup', val),

  getPress: () =>
    settingsService.get<HomepagePressItem[]>('homepage_press', DEFAULT_PRESS),
  setPress: (val: HomepagePressItem[]) =>
    settingsService.set('homepage_press', val),

  getBundles: () =>
    settingsService.get<HomepageBundleCard[]>('homepage_bundles', DEFAULT_BUNDLES),
  setBundles: (val: HomepageBundleCard[]) =>
    settingsService.set('homepage_bundles', val),

  getNoteProfiles: () =>
    settingsService.get<HomepageNoteProfile[]>('homepage_note_profiles', DEFAULT_NOTE_PROFILES),
  setNoteProfiles: (val: HomepageNoteProfile[]) =>
    settingsService.set('homepage_note_profiles', val),

  getRetailPartners: () =>
    settingsService.get<HomepageRetailPartner[]>('homepage_retail_partners', DEFAULT_RETAIL_PARTNERS),
  setRetailPartners: (val: HomepageRetailPartner[]) =>
    settingsService.set('homepage_retail_partners', val),

  getPromises: () =>
    settingsService.get<HomepagePromise[]>('homepage_promises', DEFAULT_PROMISES),
  setPromises: (val: HomepagePromise[]) =>
    settingsService.set('homepage_promises', val),

  getInstagram: () =>
    settingsService.get<HomepageInstagramPost[]>('homepage_instagram', DEFAULT_INSTAGRAM),
  setInstagram: (val: HomepageInstagramPost[]) =>
    settingsService.set('homepage_instagram', val),

  getTitles: () =>
    settingsService.get<HomepageTitles>('homepage_titles', DEFAULT_TITLES),
  setTitles: (val: HomepageTitles) =>
    settingsService.set('homepage_titles', val),

  getAll: async () => {
    const [
      announcements,
      categoryPills,
      popup,
      press,
      bundles,
      noteProfiles,
      retailPartners,
      promises,
      instagram,
      titles,
    ] = await Promise.all([
      homepageService.getAnnouncements(),
      homepageService.getCategoryPills(),
      homepageService.getPopup(),
      homepageService.getPress(),
      homepageService.getBundles(),
      homepageService.getNoteProfiles(),
      homepageService.getRetailPartners(),
      homepageService.getPromises(),
      homepageService.getInstagram(),
      homepageService.getTitles(),
    ]);

    return {
      announcements,
      categoryPills,
      popup,
      press,
      bundles,
      noteProfiles,
      retailPartners,
      promises,
      instagram,
      titles,
    };
  },
};
