import { createStore } from '@/lib/create-store';
import type { useDisclosure } from '../hooks/use-disclosure';

export type ModalCommandType = ReturnType<typeof useDisclosure>;

export interface IModalStore {
  modalState: { [key: string]: ModalCommandType };
}
export interface IModalActionStore {
  getModalAction: (modalKey: string) => ModalCommandType | undefined;
  modalRegister: (key: string, params: ModalCommandType) => void;
  delete: (key: string) => void;
}

const useModalStore = createStore<IModalStore, IModalActionStore>(
  'modal',
  {
    modalState: {},
  },
  (set, get) => ({
    getModalAction: (key: string) => get().modalState[key],
    modalRegister: (key: string, params: ModalCommandType) => {
      set((state) => {
        state.modalState[key] = params;
      });
    },
    delete: (key: string) => {
      set((state) => {
        delete state.modalState[key];
      });
    },
  }),
);
export default useModalStore;
