"use client";

import { Shield, CheckCircle2 } from "lucide-react";
import { Box, Flex, Heading, Button } from "@radix-ui/themes";

interface SecuritySectionProps {
  is2FAEnabled: boolean;
  passwordSent: boolean;
  onToggle2FA: () => void;
  onSendPassword: () => void;
}

export function SecuritySection({
  is2FAEnabled,
  passwordSent,
  onToggle2FA,
  onSendPassword,
}: SecuritySectionProps) {
  return (
    <Box>
      <Flex align="center" gap="3" mb="4">
        <Box
          p="2"
          style={{
            background: "var(--jade-a3)",
            color: "var(--jade-11)",
            borderRadius: "var(--radius-3)",
          }}
        >
          <Shield className="w-5 h-5" />
        </Box>
        <Box>
          <Heading size="5" style={{ color: "var(--card-heading)" }}>
            Bảo mật
          </Heading>
          <Box
            as="div"
            style={{ color: "var(--muted-foreground)", fontSize: "14px" }}
          >
            Quản lý bảo vệ tài khoản
          </Box>
        </Box>
      </Flex>

      <Flex direction="column" gap="1">
        {/* Password Row */}
        <Flex
          py="4"
          direction={{ initial: "column", sm: "row" }}
          align={{ initial: "start", sm: "center" }}
          justify="between"
          gap="4"
        >
          <Box>
            <Heading size="3" style={{ color: "var(--card-heading)" }}>
              Đổi mật khẩu
            </Heading>
            <Box
              as="div"
              mt="1"
              style={{ color: "var(--muted-foreground)", fontSize: "14px" }}
            >
              Cập nhật mật khẩu mới 6 tháng một lần
            </Box>
          </Box>
          <Box style={{ flexShrink: 0 }}>
            <Button
              variant="soft"
              color={passwordSent ? "jade" : "gray"}
              size="2"
              onClick={onSendPassword}
            >
              {passwordSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Đã gửi
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </Box>
        </Flex>

        {/* 2FA Row */}
        <Flex
          py="4"
          direction={{ initial: "column", sm: "row" }}
          align={{ initial: "start", sm: "center" }}
          justify="between"
          gap="4"
        >
          <Box>
            <Heading size="3" style={{ color: "var(--card-heading)" }}>
              Xác thực 2 bước (2FA)
            </Heading>
            <Box
              as="div"
              mt="1"
              style={{
                color: is2FAEnabled
                  ? "var(--jade-11)"
                  : "var(--muted-foreground)",
                fontSize: "14px",
              }}
            >
              {is2FAEnabled ? "Đang kích hoạt - Bảo mật cao" : "Chưa kích hoạt"}
            </Box>
          </Box>
          <Box style={{ flexShrink: 0 }}>
            <Button
              variant={is2FAEnabled ? "soft" : "solid"}
              color={is2FAEnabled ? "gray" : "violet"}
              size="2"
              onClick={onToggle2FA}
            >
              {is2FAEnabled ? "Tắt 2FA" : "Bật 2FA"}
            </Button>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
