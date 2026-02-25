
export const getAssetsUrl = (name: string) => {
//   return new URL(`@/assets/logo.png`, import.meta.url).href;
    return '/src/assets/'+name;
};