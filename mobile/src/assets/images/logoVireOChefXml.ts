import raw from './logoVireOChef.inline';

export const logoVireOChefXml = raw;

export const getLogoVireOChefXml = (color?: string) => {
  if (!color) {
    return raw;
  }

  return raw.replace(/fill="[^"]*"/g, `fill="${color}"`);
};
