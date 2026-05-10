import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    void i18n.changeLanguage(event.target.value);
  }

  return (
    <label className="lang-switcher">
      <span>{t("language.label")}</span>
      <select value={i18n.resolvedLanguage} onChange={handleChange}>
        <option value="cs">{t("language.cs")}</option>
        <option value="en">{t("language.en")}</option>
      </select>
    </label>
  );
}