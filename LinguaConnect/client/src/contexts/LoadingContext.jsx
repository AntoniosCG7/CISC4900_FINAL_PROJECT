import { createContext, useContext, useState } from "react";
import Spinner from "../components/UIElements/Spinner/Spinner";

export const LoadingContext = createContext();

export function useLoading() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
      {loading && <Spinner />}
    </LoadingContext.Provider>
  );
}
