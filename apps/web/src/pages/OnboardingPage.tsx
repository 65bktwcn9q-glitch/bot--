import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenContainer } from "../components/layout/ScreenContainer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client";
import { useApp } from "../context/AppContext";

const levels = ["A1", "A2", "B1", "B2"];
const goals = [
  { value: "grammar", label: "Grammatik" },
  { value: "vocabulary", label: "Wortschatz" },
  { value: "reading", label: "Lesen" },
  { value: "listening", label: "Hörverstehen (bald)" }
];

const OnboardingPage: React.FC = () => {
  const { initData } = useTelegram();
  const { refresh } = useApp();
  const navigate = useNavigate();
  const [level, setLevel] = useState("A1");
  const [goal, setGoal] = useState("grammar");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await api.updateSettings({ level, goal }, initData);
    await refresh();
    navigate("/");
  };

  return (
    <ScreenContainer
      title="Willkommen!"
      subtitle="Stelle dein persönliches Lernprofil ein."
    >
      <Card className="space-y-4">
        <Select label="Dein Niveau" value={level} onChange={(e) => setLevel(e.target.value)}>
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </Select>
        <Select label="Fokus" value={goal} onChange={(e) => setGoal(e.target.value)}>
          {goals.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
        <Button onClick={handleSubmit} disabled={loading}>
          Profil speichern
        </Button>
      </Card>
    </ScreenContainer>
  );
};

export default OnboardingPage;
