import React from "react";
import { useI18n } from "../i18n/I18nContext";

const Header: React.FC = () => {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="w-full flex justify-end p-4">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as typeof language)}
        className="bg-gray-700 text-white p-2 rounded-md"
      >
        <option value="pt">Português</option>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
};

export default Header;
