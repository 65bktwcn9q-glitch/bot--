import React, { useState } from "react";
import { ScreenContainer } from "../components/layout/ScreenContainer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { useApp } from "../context/AppContext";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client";

const levels = ["A1", "A2", "B1", "B2"];
const goals = [
  { value: "grammar", label: "Grammatik" },
  { value: "vocabulary", label: "Wortschatz" },
  { value: "reading", label: "Lesen" },
  { value: "listening", label: "Hörverstehen" }
];

const SettingsPage: React.FC = () => {
  const { user, refresh } = useApp();
  const { initData } = useTelegram();
  const [language, setLanguage] = useState(user?.language ?? "ru");
  const [level, setLevel] = useState(user?.level ?? "A1");
  const [goal, setGoal] = useState(user?.goal ?? "grammar");
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const saveSettings = async () => {
    await api.updateSettings({ language, level, goal }, initData);
    await refresh();
  };

  const resetProgress = async () => {
    await api.resetProgress(initData);
    await refresh();
  };

  const toggleTheme = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
  };

  return (
    <ScreenContainer title="Einstellungen" subtitle="Passe dein Lernen an">
      <Card className="space-y-3">
        <Select label="Niveau" value={level} onChange={(e) => setLevel(e.target.value)}>
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </Select>
        <Select label="Ziel" value={goal} onChange={(e) => setGoal(e.target.value)}>
          {goals.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
        <Select label="Sprache" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="ru">Русский</option>
          <option value="de">Deutsch</option>
        </Select>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Dark Mode</span>
          <Switch checked={darkMode} onCheckedChange={toggleTheme} />
        </div>
        <Button onClick={saveSettings}>Speichern</Button>
      </Card>

      <Card className="space-y-2">
        <h3 className="text-lg font-semibold">Fortschritt zurücksetzen</h3>
        <p className="text-xs text-slate-500">
          Löscht Trainingshistorie und setzt Punkte zurück.
        </p>
        <Button variant="ghost" onClick={resetProgress}>
          Reset progress
        </Button>
      </Card>
    </ScreenContainer>
  );
};

export default SettingsPage;
