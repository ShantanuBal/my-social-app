// lib/config.ts
export const getTableName = () => {
  const environment = process.env.NODE_ENV === 'production' ? 'production' : 'local';
  return `anti-seattle-freeze-events-${environment}`;
};

export const config = {
  aws: {
    region: process.env.AWS_REGION || 'us-west-2',
    tableName: getTableName(),
  }
};