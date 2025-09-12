export const getTableName = (tableType: 'events' | 'registrations' | 'users' | 'connections') => {
  const environment = process.env.NODE_ENV === 'production' ? 'production' : 'local';
  return `${tableType}-${environment}`;
};

export const config = {
  aws: {
    region: process.env.AWS_REGION || 'us-west-2',
    eventsTable: getTableName('events'),
    registrationsTable: getTableName('registrations'),
    usersTable: getTableName('users'),
    connectionsTable: getTableName('connections'),
  }
};