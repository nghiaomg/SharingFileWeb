"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Shield,
  CreditCard,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Box,
  Flex,
  Grid,
  Card,
  Heading,
  Text,
  TextField,
  Button,
  Badge,
} from "@radix-ui/themes";

export default function SettingsPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Hồ sơ đã được lưu thành công!");
    }, 1500);
  };

  const handleLogout = () => {
    // Here we could clear auth tokens if any existed
    router.push("/login");
  };

  return (
    <Box
      p="6"
      pb="9"
      style={{ height: "100%", overflowY: "auto", position: "relative" }}
    >
      <Flex align="center" gap="3" mt="2" mb="6">
        <Settings
          className="w-8 h-8"
          style={{ color: "var(--icon-storage)" }}
        />
        <Heading size="8" style={{ color: "var(--card-heading)" }}>
          Cài đặt & Hồ sơ
        </Heading>
      </Flex>

      <Grid columns={{ initial: "1", lg: "2", xl: "3" }} gap="6" width="100%">
        {/* Column 1: Profile & Security */}
        <Flex direction="column" gap="6" className="xl:col-span-2">
          {/* General Profile */}
          <Card size="4" variant="surface">
            <Flex
              direction={{ initial: "column", sm: "row" }}
              align={{ initial: "start", sm: "center" }}
              gap="5"
              mb="5"
              pb="5"
              style={{ borderBottom: "1px solid var(--gray-a6)" }}
            >
              <Box position="relative" style={{ flexShrink: 0 }}>
                <Box
                  width="96px"
                  height="96px"
                  style={{
                    padding: "3px",
                    borderRadius: "100%",
                    background:
                      "linear-gradient(to top right, var(--gray-12), var(--gray-11))",
                  }}
                >
                  <Flex
                    align="center"
                    justify="center"
                    width="100%"
                    height="100%"
                    style={{
                      background: "var(--color-panel-solid)",
                      borderRadius: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <User className="w-10 h-10" />
                  </Flex>
                </Box>
                <Box position="absolute" bottom="0" right="0">
                  <Button
                    variant="outline"
                    size="1"
                    color="gray"
                    radius="full"
                    style={{
                      padding: "4px 8px",
                      background: "var(--color-panel-solid)",
                    }}
                  >
                    Sửa
                  </Button>
                </Box>
              </Box>
              <Box>
                <Heading size="6" style={{ color: "var(--card-heading)" }}>
                  Trung Nghĩa
                </Heading>
                <Text
                  as="div"
                  size="3"
                  mt="1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  trungnghia@example.com
                </Text>
                <Box mt="3">
                  <Badge size="2" color="gray" variant="soft">
                    PRO PLAN
                  </Badge>
                </Box>
              </Box>
            </Flex>

            <Flex direction="column" gap="5">
              <Grid columns={{ initial: "1", sm: "2" }} gap="5">
                <Box>
                  <Text
                    as="label"
                    size="2"
                    weight="bold"
                    mb="2"
                    style={{
                      display: "block",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Tên hiển thị
                  </Text>
                  <TextField.Root size="3" defaultValue="Trung Nghĩa" />
                </Box>
                <Box>
                  <Text
                    as="label"
                    size="2"
                    weight="bold"
                    mb="2"
                    style={{
                      display: "block",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Số điện thoại
                  </Text>
                  <TextField.Root size="3" type="tel" placeholder="+84 ..." />
                </Box>
              </Grid>

              <Grid columns={{ initial: "1", sm: "2" }} gap="5">
                <Box>
                  <Text
                    as="label"
                    size="2"
                    weight="bold"
                    mb="2"
                    style={{
                      display: "block",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Quốc gia
                  </Text>
                  <TextField.Root size="3" defaultValue="Việt Nam" />
                </Box>
                <Box>
                  <Text
                    as="label"
                    size="2"
                    weight="bold"
                    mb="2"
                    style={{
                      display: "block",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Công ty / Tổ chức
                  </Text>
                  <TextField.Root size="3" placeholder="Nhập tên tổ chức..." />
                </Box>
              </Grid>

              <Flex justify="end" pt="3">
                <Button
                  size="3"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  loading={isSaving}
                  color="gray"
                >
                  Lưu thay đổi hồ sơ
                </Button>
              </Flex>
            </Flex>
          </Card>

          {/* Security */}
          <Card size="4" variant="surface">
            <Flex align="center" gap="3" mb="4">
              <Box
                p="2"
                style={{
                  background: "var(--jade-a3)",
                  color: "var(--jade-11)",
                  borderRadius: "var(--radius-3)",
                }}
              >
                <Shield className="w-6 h-6" />
              </Box>
              <Box>
                <Heading size="5" style={{ color: "var(--card-heading)" }}>
                  Bảo mật tài khoản
                </Heading>
                <Text
                  as="div"
                  size="2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Quản lý lớp bảo vệ cho dữ liệu của bạn
                </Text>
              </Box>
            </Flex>

            <Flex
              direction="column"
              style={{ borderTop: "1px solid var(--gray-a6)" }}
            >
              <Flex
                py="4"
                direction={{ initial: "column", sm: "row" }}
                align={{ initial: "start", sm: "center" }}
                justify="between"
                gap="4"
                style={{ borderBottom: "1px solid var(--gray-a6)" }}
              >
                <Box>
                  <Heading size="3" style={{ color: "var(--card-heading)" }}>
                    Đổi mật khẩu
                  </Heading>
                  <Text
                    as="div"
                    size="2"
                    mt="1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Cập nhật mật khẩu mới 6 tháng một lần để an toàn
                  </Text>
                </Box>
                <Box style={{ flexShrink: 0 }}>
                  <Button
                    variant="soft"
                    color={passwordSent ? "jade" : "gray"}
                    onClick={() => setPasswordSent(true)}
                  >
                    {passwordSent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Đã gửi email
                      </>
                    ) : (
                      "Cập nhật mã"
                    )}
                  </Button>
                </Box>
              </Flex>

              <Flex
                py="4"
                direction={{ initial: "column", sm: "row" }}
                align={{ initial: "start", sm: "center" }}
                justify="between"
                gap="4"
              >
                <Box>
                  <Heading size="3">Xác thực 2 bước (2FA)</Heading>
                  <Text
                    as="div"
                    size="2"
                    color={is2FAEnabled ? "jade" : "red"}
                    weight="medium"
                    mt="1"
                  >
                    {is2FAEnabled
                      ? "Đang kích hoạt - Bảo mật cao"
                      : "Chưa kích hoạt - Nguy cơ rủi ro cao"}
                  </Text>
                </Box>
                <Box style={{ flexShrink: 0 }}>
                  <Button
                    variant={is2FAEnabled ? "soft" : "solid"}
                    color={is2FAEnabled ? "gray" : "violet"}
                    onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  >
                    {is2FAEnabled ? "Tắt 2FA" : "Bật ngay"}
                  </Button>
                </Box>
              </Flex>
            </Flex>
          </Card>
        </Flex>

        {/* Column 2: Subscription & Actions */}
        <Flex direction="column" gap="6">
          {/* Subscription Settings */}
          <Card size="4" variant="surface">
            <Flex align="center" gap="3" mb="4">
              <Box
                p="2"
                style={{
                  background: "var(--amber-a3)",
                  color: "var(--amber-11)",
                  borderRadius: "var(--radius-3)",
                }}
              >
                <CreditCard className="w-6 h-6" />
              </Box>
              <Box>
                <Heading size="5" style={{ color: "var(--card-heading)" }}>
                  Gói lưu trữ
                </Heading>
                <Text
                  as="div"
                  size="2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Thông tin thanh toán & gia hạn
                </Text>
              </Box>
            </Flex>

            <Box
              p="5"
              mb="2"
              style={{
                background: "var(--gray-a2)",
                border: "1px solid var(--gray-a5)",
                borderRadius: "var(--radius-4)",
              }}
            >
              <Flex direction="column" gap="4" mb="5">
                <Box>
                  <Flex align="center" gap="2">
                    <Heading
                      size="6"
                      style={{ color: "var(--card-heading)" }}
                      weight="bold"
                    >
                      FileFlow Pro
                    </Heading>
                    <Badge size="1" color="gray" variant="solid" radius="full">
                      HOT
                    </Badge>
                  </Flex>
                  <Text
                    as="div"
                    size="2"
                    mt="2"
                    weight="medium"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Chu kỳ tiếp theo: 24/05/2024
                  </Text>
                </Box>
                <Flex align="baseline" gap="1">
                  <Heading
                    size="8"
                    weight="bold"
                    style={{ color: "var(--card-heading)" }}
                  >
                    $9.99
                  </Heading>
                  <Text
                    as="span"
                    size="3"
                    weight="medium"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    /tháng
                  </Text>
                </Flex>
              </Flex>

              <Flex direction="column" gap="3">
                <Button asChild size="3" variant="soft" color="gray">
                  <Link href="#">Nâng cấp gói doanh nghiệp</Link>
                </Button>
                <Button asChild size="3" variant="outline" color="gray">
                  <Link href="/dashboard/billing">Quản lý hóa đơn</Link>
                </Button>
              </Flex>
            </Box>
          </Card>

          {/* Danger Zone */}
          <Box pt="2">
            <Button
              size="3"
              variant="outline"
              color="red"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-1" />
              Đăng xuất khỏi thiết bị này
            </Button>
          </Box>
        </Flex>
      </Grid>
    </Box>
  );
}
