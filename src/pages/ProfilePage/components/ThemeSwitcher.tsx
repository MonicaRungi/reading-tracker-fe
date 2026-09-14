import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ThemePreference } from "@/api/profile";
import {
  SegmentedToggle,
  type SegmentedToggleOption,
} from "@/components/shared/SegmentedToggle";

export function ThemeSwitcher({
  value,
  onChange,
}: {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
}) {
  const { t } = useTranslation();

  const options: SegmentedToggleOption<ThemePreference>[] = [
    {
      value: "light",
      label: t("profile.themeLight"),
      icon: <Sun className="size-4" />,
    },
    {
      value: "dark",
      label: t("profile.themeDark"),
      icon: <Moon className="size-4" />,
    },
    {
      value: "auto",
      label: t("profile.themeAuto"),
      icon: <Monitor className="size-4" />,
    },
  ];

  return <SegmentedToggle value={value} onChange={onChange} options={options} />;
}
