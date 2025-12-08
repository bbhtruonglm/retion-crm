import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

/**
 * Component chuyển đổi ngôn ngữ
 * @returns {JSX.Element} - Giao diện LanguageSwitcher
 */
const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  /**
   * Xử lý thay đổi ngôn ngữ
   * @param {string} locale - Mã ngôn ngữ (vi hoặc en)
   */
  const HandleChangeLanguage = (locale: string) => {
    /** Thay đổi ngôn ngữ */
    i18n.changeLanguage(locale);
    /** Lưu vào localStorage */
    localStorage.setItem("i18nextLng", locale);

    /** Cập nhật URL (optional) */
    const NEW_URL = new URL(window.location.href);
    NEW_URL.searchParams.set("locale", locale);
    window.history.replaceState({}, "", NEW_URL.toString());
  };

  /** Ngôn ngữ hiện tại */
  const CURRENT_LANG = i18n.language || "vi";

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <select
        value={CURRENT_LANG}
        onChange={(e) => HandleChangeLanguage(e.target.value)}
        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="vi">Tiếng Việt</option>
        <option value="en">English</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
