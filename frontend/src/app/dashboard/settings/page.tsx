"use client";

import { useState } from "react";
import { Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Box, Flex, Grid, Heading, Button } from "@radix-ui/themes";
import { ProfileSection } from "./_components/ProfileSection";
import { SecuritySection } from "./_components/SecuritySection";
import { SubscriptionSection } from "./_components/SubscriptionSection";

export default function SettingsPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <Box
      p={{ initial: "4", sm: "6", lg: "8" }}
      pb="9"
      style={{ height: "100%", overflowY: "auto", position: "relative" }}
    >
      {/* Page Header */}
      <Flex align="center" gap="3" mb="8">
        <Settings
          className="w-7 h-7"
          style={{ color: "var(--icon-storage)" }}
        />
        <Heading size="8" style={{ color: "var(--card-heading)" }}>
          Cài đặt
        </Heading>
      </Flex>

      {/* Content Grid */}
      <Grid columns={{ initial: "1", xl: "2" }} gap="8" width="100%">
        {/* Left Column */}
        <Flex direction="column" gap="8">
          <ProfileSection isSaving={isSaving} onSave={handleSaveProfile} />
          <SecuritySection
            is2FAEnabled={is2FAEnabled}
            passwordSent={passwordSent}
            onToggle2FA={() => setIs2FAEnabled(!is2FAEnabled)}
            onSendPassword={() => setPasswordSent(true)}
          />
        </Flex>

        {/* Right Column */}
        <Flex direction="column" gap="6">
          <SubscriptionSection />

          {/* Logout */}
          <Box mt="auto">
            <Button
              size="3"
              variant="ghost"
              color="red"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </Button>
          </Box>
        </Flex>
      </Grid>
    </Box>
  );
}
