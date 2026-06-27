/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    localizedUrl: (path: string) => string;
    $t: (key: string, ...args: unknown[]) => string;
  }
}
export {}  // important! see note.
