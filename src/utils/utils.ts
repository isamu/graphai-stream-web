import { computed } from "vue";
import { useI18n } from "vue-i18n";
import router from "@/router";


export const useLang = () => {
  const i18n = useI18n();

  const lang = computed(() => {
    return i18n.locale.value;
  });

  const localizedUrl = (path: string) => {
    if (lang.value) {
      return `/${lang.value}` + path;
    }
    return path;
  };

  return {
    lang,
    localizedUrl,
  };
};

export const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const useLocalizedRoute = () => {
  const { localizedUrl } = useLang();

  return (path: string) => {
    router.push(localizedUrl(path));
  };
};

