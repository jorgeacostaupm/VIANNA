declare module '@/components/VAPUtils/features/store.js' {
  import { Store } from 'redux';
  const store: Store;
  export default store;
}

export type RootState = ReturnType<typeof root_reducer>;
