set search_path to 'fussballer';

-- https://www.postgresql.org/docs/current/sql-droptable.html

DROP TABLE IF EXISTS fussballer_file CASCADE;
DROP TABLE IF EXISTS adresse CASCADE;
DROP TABLE IF EXISTS auszeichnung CASCADE;
DROP TABLE IF EXISTS fussballer CASCADE;

-- https://www.postgresql.org/docs/current/sql-droptype.html
DROP TYPE IF EXISTS position;
