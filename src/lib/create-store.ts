import { enableMapSet } from 'immer';
import {
  type Mutate,
  type StateCreator,
  type StoreApi,
  type UseBoundStore,
  create as zustandCreate,
} from 'zustand';
import {
  type PersistOptions,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

enableMapSet();

type Actions<T extends object, U extends object> = StateCreator<
  T & U,
  [
    ['zustand/persist', never],
    ['zustand/subscribeWithSelector', never],
    ['zustand/immer', never],
  ],
  [
    ['zustand/immer', never],
    ['zustand/subscribeWithSelector', never],
    ['zustand/persist', never],
  ],
  U
>;
export type PersistStore<T extends object, U extends object> = UseBoundStore<
  Mutate<
    StoreApi<T & U>,
    [
      ['zustand/persist', never],
      ['zustand/subscribeWithSelector', never],
      ['zustand/immer', never],
    ]
  >
>;

export type Store<T extends object, U extends object> = UseBoundStore<
  Mutate<
    StoreApi<T & U>,
    [
      ['zustand/immer', never],
      ['zustand/subscribeWithSelector', never],
    ]
  >
>;

export function createStore<T extends object, U extends object>(
  name: string,
  state: T,
  actions: Actions<T, U>,
): Store<T, U>;
export function createStore<T extends object, U extends object>(
  name: string,
  state: T,
  actions: Actions<T, U>,
  persistOptions: Partial<PersistOptions<T & U, Partial<T>>>,
): PersistStore<T, U>;
export function createStore<
  T extends object,
  U extends object,
  PersistOpts = Partial<PersistOptions<T & U, Partial<T>>> | undefined,
>(
  name: string,
  state: T,
  actions: Actions<T, U>,
  persistOptions?: PersistOpts,
) {
  if (persistOptions) {
    return zustandCreate<T & U>()(
      persist(
        subscribeWithSelector(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            immer((...a) => Object.assign({}, state, (actions as any)(...a))),
        ),
        { ...persistOptions, name },
      ),
    );
  }
  return zustandCreate<T & U>()(
    subscribeWithSelector(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        immer((...a) => Object.assign({}, state, (actions as any)(...a))),

    ),
  );
}
