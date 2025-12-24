import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@/redux/store";

export function ReduxPersistGate({ children }: { children: React.ReactNode }) {
  return (
    <PersistGate loading={null} persistor={persistor}>
      {children}
    </PersistGate>
  );
}
