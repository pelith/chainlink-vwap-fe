import { useEffect, useRef } from 'react';
import useModalStore from '@/modules/commons/stores/modal-store';
import { useDisclosure } from '../use-disclosure';

export function useModalRegister(key: string) {
  const modalRegisterRef = useRef(useModalStore.getState().modalRegister);
  const deleteRef = useRef(useModalStore.getState().delete);
  const disclosureParams = useDisclosure();

  useEffect(() => {
    modalRegisterRef.current(key, disclosureParams);
    return () => {
      deleteRef.current(key);
    };
  }, [key, disclosureParams.isOpen]);

  useEffect(
    () =>
      useModalStore.subscribe(
        (state) => (modalRegisterRef.current = state.modalRegister),
      ),
    [],
  );

  useEffect(
    () =>
      useModalStore.subscribe((state) => (deleteRef.current = state.delete)),
    [],
  );

  return disclosureParams;
}