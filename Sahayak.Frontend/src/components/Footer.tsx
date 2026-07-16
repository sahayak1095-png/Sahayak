import { useLanguage } from '../contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer>
      {t('footer.text')}
    </footer>
  )
}
