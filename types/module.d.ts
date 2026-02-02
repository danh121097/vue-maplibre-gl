declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const Component: DefineComponent<
    Record<string, never>,
    Record<string, never>,
    unknown
  >;
  export default Component;
}
