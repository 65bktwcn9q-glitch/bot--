import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { BottomNav } from "./components/layout/BottomNav";
import { useTelegram } from "./hooks/useTelegram";
import OnboardingPage from "./pages/OnboardingPage";
import HomePage from "./pages/HomePage";
import TrainingPage from "./pages/TrainingPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";

const App: React.FC = () => {
  const { webApp, theme } = useTelegram();

  useEffect(() => {
    if (webApp?.colorScheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [webApp?.colorScheme]);

  useEffect(() => {
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--tg-${key}`, value);
    });
  }, [theme]);

  return (
    <AppProvider>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </AppProvider>
  );
};

export default App;
