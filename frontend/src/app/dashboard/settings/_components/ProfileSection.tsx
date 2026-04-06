"use client";

import { User } from "lucide-react";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  TextField,
  Button,
  Badge,
} from "@radix-ui/themes";

function SectionHeader({
  icon,
  iconBg,
  iconColor,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <Flex align="center" gap="3" mb="4">
      <Box
        p="2"
        style={{
          background: iconBg,
          color: iconColor,
          borderRadius: "var(--radius-3)",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Heading size="5" style={{ color: "var(--card-heading)" }}>
          {title}
        </Heading>
        <Text as="div" size="2" style={{ color: "var(--muted-foreground)" }}>
          {description}
        </Text>
      </Box>
    </Flex>
  );
}

interface ProfileSectionProps {
  isSaving: boolean;
  onSave: () => void;
}

export function ProfileSection({ isSaving, onSave }: ProfileSectionProps) {
  return (
    <Box>
      <SectionHeader
        icon={<User className="w-5 h-5" />}
        iconBg="var(--gray-a3)"
        iconColor="var(--color-foreground)"
        title="Hồ sơ cá nhân"
        description="Thông tin cơ bản của bạn"
      />

      {/* Avatar */}
      <Flex
        direction={{ initial: "column", sm: "row" }}
        align={{ initial: "center", sm: "start" }}
        gap="5"
        mb="6"
      >
        <Box position="relative">
          <Box
            width="80px"
            height="80px"
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
              }}
            >
              <User className="w-8 h-8" />
            </Flex>
          </Box>
          <Button
            variant="solid"
            size="1"
            color="gray"
            radius="full"
            style={{
              position: "absolute",
              bottom: -4,
              right: -4,
              padding: "4px 10px",
              fontSize: "11px",
            }}
          >
            Sửa
          </Button>
        </Box>

        <Box>
          <Heading size="5" style={{ color: "var(--card-heading)" }}>
            Trung Nghĩa
          </Heading>
          <Text size="3" mt="1" style={{ color: "var(--muted-foreground)" }}>
            trungnghia@example.com
          </Text>
          <Badge size="2" mt="2" color="gray" variant="soft">
            PRO PLAN
          </Badge>
        </Box>
      </Flex>

      {/* Form Fields */}
      <Flex direction="column" gap="5">
        <Grid columns={{ initial: "1", sm: "2" }} gap="4">
          <Box>
            <Text
              as="label"
              size="2"
              weight="medium"
              mb="2"
              style={{ display: "block", color: "var(--muted-foreground)" }}
            >
              Tên hiển thị
            </Text>
            <TextField.Root size="3" defaultValue="Trung Nghĩa" />
          </Box>
          <Box>
            <Text
              as="label"
              size="2"
              weight="medium"
              mb="2"
              style={{ display: "block", color: "var(--muted-foreground)" }}
            >
              Số điện thoại
            </Text>
            <TextField.Root size="3" type="tel" placeholder="+84 ..." />
          </Box>
        </Grid>

        <Grid columns={{ initial: "1", sm: "2" }} gap="4">
          <Box>
            <Text
              as="label"
              size="2"
              weight="medium"
              mb="2"
              style={{ display: "block", color: "var(--muted-foreground)" }}
            >
              Quốc gia
            </Text>
            <TextField.Root size="3" defaultValue="Việt Nam" />
          </Box>
          <Box>
            <Text
              as="label"
              size="2"
              weight="medium"
              mb="2"
              style={{ display: "block", color: "var(--muted-foreground)" }}
            >
              Công ty / Tổ chức
            </Text>
            <TextField.Root size="3" placeholder="Nhập tên tổ chức..." />
          </Box>
        </Grid>

        <Flex justify="end">
          <Button size="3" onClick={onSave} loading={isSaving} color="gray">
            Lưu thay đổi
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
