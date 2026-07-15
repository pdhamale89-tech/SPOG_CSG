export const REGION_COUNTRIES = {
  AMER: ['US','CA','MX','BR','AR','CL','CO','PE','VE','EC','BO','PY','UY','GT','HN','SV','NI','CR','PA','DO','CU','HT','JM','TT','GY','SR','BZ','GL'],
  EMEA: ['GB','IE','FR','DE','ES','PT','IT','NL','BE','LU','CH','AT','SE','NO','DK','FI','IS','PL','CZ','SK','HU','RO','BG','GR','HR','SI','RS','BA','MK','AL','ME','XK','EE','LV','LT','UA','BY','MD','RU','TR','CY','MT','ZA','EG','NG','KE','MA','DZ','TN','LY','SA','AE','IL','QA','KW','BH','OM','JO','LB','IQ','IR','GH','ET','TZ','UG','AO','MZ','ZM','ZW','SN','CI','CM'],
  APJ: ['CN','JP','KR','IN','AU','NZ','SG','MY','TH','VN','ID','PH','TW','HK','PK','BD','LK','NP','MM','KH','LA','MN','BN','MO','FJ','PG','KZ','UZ','AF'],
};

export const REGION_ACC = { AMER: 78, EMEA: 66, APJ: 48 };

export const COUNTRY_REGION = Object.keys(REGION_COUNTRIES).reduce((acc, region) => {
  REGION_COUNTRIES[region].forEach((code) => { acc[code] = region; });
  return acc;
}, {});

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Deterministic per-country accuracy derived from its region's baseline (no live country-level feed yet).
export const COUNTRY_ACC = Object.keys(COUNTRY_REGION).reduce((acc, code) => {
  const base = REGION_ACC[COUNTRY_REGION[code]];
  const variance = (hashCode(code) % 21) - 10; // -10..+10
  acc[code] = Math.max(30, Math.min(96, base + variance));
  return acc;
}, {});

export const MAJOR_COUNTRIES = ['US', 'CA', 'MX', 'BR', 'AR', 'GB', 'DE', 'FR', 'ES', 'IT', 'RU', 'CN', 'JP', 'IN', 'AU', 'ZA', 'SA', 'KR', 'ID', 'NG'];
