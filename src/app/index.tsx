import { ViloratechSplash } from "@/components/StartScreen/Viloratech-splash";
import { useSessionStore } from "@/providers/store/useSessionStore";
import { useEffect } from "react";

export default function SplashRoute() {
  const setSplashFinished = useSessionStore((s) => s.setSplashFinished);

  useEffect(() => {
    console.log("[SPLASH ROUTE] Mounted");

    return () => console.log("[SPLASH ROUTE] Unmounted");
  }, []);

  return (
    <ViloratechSplash
      duration={5000}
      onFinished={() => {
        console.log("[SPLASH ROUTE] onFinished fired");
        setSplashFinished(true);
      }}
    />
  );
}
