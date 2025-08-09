interface LocaleData {
  [key: string]: string | string[] | number | LocaleData;
}

declare module '@angular/common/locales/zh' {
  const locale: LocaleData;
  export default locale;
}

declare module '@angular/common/locales/zh-Hant' {
  const locale: LocaleData;
  export default locale;
}

declare module '@angular/common/locales/en' {
  const locale: LocaleData;
  export default locale;
}

declare module '@angular/common/locales/ja' {
  const locale: LocaleData;
  export default locale;
}
