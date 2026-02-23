import useModalStore from '@/modules/commons/stores/modal-store';

const mockFn = () => {};

export function useModalActions(key: string) {
  const createActions =
    (key: string, act: 'onOpen' | 'onClose' | 'onToggle') => () =>
      useModalStore.getState().getModalAction(key)?.[act]() ?? mockFn;
  return {
    onOpen: createActions(key, 'onOpen'),
    onClose: createActions(key, 'onClose'),
    onToggle: createActions(key, 'onToggle'),
    get isOpen() {
      return useModalStore.getState().getModalAction(key)?.isOpen ?? false;
    },
  };
}
