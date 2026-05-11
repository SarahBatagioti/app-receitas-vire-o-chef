const DEFAULT_ANDROID_PACKAGE_NAME = 'com.mobile';

function readStringList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getAndroidAppLinksStatement() {
  return {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name:
        process.env.ANDROID_APP_LINK_PACKAGE_NAME?.trim() || DEFAULT_ANDROID_PACKAGE_NAME,
      sha256_cert_fingerprints: readStringList(process.env.ANDROID_APP_LINK_SHA256_CERT_FINGERPRINTS),
    },
  };
}

export function getAppleAppSiteAssociation() {
  return {
    applinks: {
      apps: [],
      details: readStringList(process.env.IOS_APP_LINK_APP_IDS).map((appId) => ({
        appID: appId,
        paths: ['/receitas/*'],
      })),
    },
  };
}
