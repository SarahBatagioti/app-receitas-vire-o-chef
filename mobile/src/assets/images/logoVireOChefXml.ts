import lightRaw from './logoVireOChef.inline';
import darkRaw from './logoVireOChefBranco.inline';

const normalizeLogoXml = (xml: string) =>
  xml
    .replace(/<svg\b([^>]*)\swidth="[^"]*"\sheight="[^"]*"/, '<svg$1')
    .replace('<svg ', '<svg preserveAspectRatio="xMidYMid meet" ');

export const LOGO_VIRE_O_CHEF_WIDTH = 545;
export const LOGO_VIRE_O_CHEF_HEIGHT = 647;
export const LOGO_VIRE_O_CHEF_ASPECT_RATIO =
  LOGO_VIRE_O_CHEF_WIDTH / LOGO_VIRE_O_CHEF_HEIGHT;

export const logoVireOChefXml = normalizeLogoXml(lightRaw);
export const logoVireOChefBrancoXml = normalizeLogoXml(darkRaw);

export const getLogoVireOChefXml = (themeMode: 'light' | 'dark' = 'light') =>
  themeMode === 'dark' ? logoVireOChefBrancoXml : logoVireOChefXml;
