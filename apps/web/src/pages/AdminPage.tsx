import React, { useEffect, useState } from "react";
import { ScreenContainer } from "../components/layout/ScreenContainer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client";
import { AdItem } from "../components/ads/AdBanner";

const AdminPage: React.FC = () => {
  const { initData } = useTelegram();
  const [users, setUsers] = useState<any[]>([]);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [aiLogs, setAiLogs] = useState<any[]>([]);
  const [vipTelegramId, setVipTelegramId] = useState("");
  const [vipPlan, setVipPlan] = useState("PREMIUM");
  const [adForm, setAdForm] = useState({
    type: "BANNER",
    title: "",
    text: "",
    imageUrl: "",
    linkUrl: ""
  });
  const [monetization, setMonetization] = useState({
    freeDailyLimit: 5,
    adsEnabled: true,
    adsInterval: 3
  });

  const load = async () => {
    const [usersRes, adsRes, logsRes] = await Promise.all([
      api.adminUsers(initData),
      api.adminAds(initData),
      api.adminAiLogs(initData)
    ]);
    setUsers((usersRes.users as any[]) ?? []);
    setAds((adsRes.ads as AdItem[]) ?? []);
    setAiLogs((logsRes.logs as any[]) ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const setVip = async () => {
    await api.adminVip({ telegramId: vipTelegramId, plan: vipPlan }, initData);
    await load();
  };

  const revokeVip = async () => {
    await api.adminVipRevoke({ telegramId: vipTelegramId }, initData);
    await load();
  };

  const createAd = async () => {
    await api.adminCreateAd(adForm, initData);
    setAdForm({ type: "BANNER", title: "", text: "", imageUrl: "", linkUrl: "" });
    await load();
  };

  const saveMonetization = async () => {
    await api.adminMonetization(monetization, initData);
    await load();
  };

  return (
    <ScreenContainer title="Admin" subtitle="Verwaltung & Monetarisierung">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">VIP verwalten</h3>
        <Input
          label="Telegram ID"
          value={vipTelegramId}
          onChange={(e) => setVipTelegramId(e.target.value)}
        />
        <Select label="Plan" value={vipPlan} onChange={(e) => setVipPlan(e.target.value)}>
          <option value="PREMIUM">Premium</option>
          <option value="LIFETIME">Lifetime</option>
        </Select>
        <div className="flex gap-2">
          <Button onClick={setVip}>VIP setzen</Button>
          <Button variant="ghost" onClick={revokeVip}>
            VIP entfernen
          </Button>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Werbung</h3>
        <Select label="Typ" value={adForm.type} onChange={(e) => setAdForm({ ...adForm, type: e.target.value })}>
          <option value="BANNER">Banner</option>
          <option value="FULLSCREEN">Fullscreen</option>
        </Select>
        <Input
          label="Titel"
          value={adForm.title}
          onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
        />
        <Input
          label="Text"
          value={adForm.text}
          onChange={(e) => setAdForm({ ...adForm, text: e.target.value })}
        />
        <Input
          label="Bild-URL"
          value={adForm.imageUrl}
          onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })}
        />
        <Input
          label="Link-URL"
          value={adForm.linkUrl}
          onChange={(e) => setAdForm({ ...adForm, linkUrl: e.target.value })}
        />
        <Button onClick={createAd}>Anzeige speichern</Button>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Monetarisierung</h3>
        <Input
          label="Free-Limit pro Tag"
          type="number"
          value={monetization.freeDailyLimit}
          onChange={(e) =>
            setMonetization({ ...monetization, freeDailyLimit: Number(e.target.value) })
          }
        />
        <Input
          label="Anzeige-Intervall"
          type="number"
          value={monetization.adsInterval}
          onChange={(e) =>
            setMonetization({ ...monetization, adsInterval: Number(e.target.value) })
          }
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Ads aktiviert</span>
          <Switch
            checked={monetization.adsEnabled}
            onCheckedChange={(checked) =>
              setMonetization({ ...monetization, adsEnabled: checked })
            }
          />
        </div>
        <Button onClick={saveMonetization}>Speichern</Button>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Userliste</h3>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold">{user.telegramId}</p>
                <p className="text-slate-400">{user.subscription?.plan ?? "FREE"}</p>
              </div>
              <span>{user.dailyTaskCount} Aufgaben</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">AI Logs</h3>
        <div className="space-y-2 text-xs">
          {aiLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between">
              <span>{log.taskType}</span>
              <span className="text-slate-400">{log.status}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Aktive Anzeigen</h3>
        {ads.map((ad) => (
          <div key={ad.id} className="text-xs">
            <p className="font-semibold">{ad.title}</p>
            <p className="text-slate-400">{ad.type}</p>
          </div>
        ))}
      </Card>
    </ScreenContainer>
  );
};

export default AdminPage;
