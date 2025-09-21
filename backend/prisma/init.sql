-- GROWF Database Initialization
-- This file is executed when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (handled by POSTGRES_DB environment variable)
-- The database 'growf' will be created automatically by Docker

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Basic database configuration
ALTER DATABASE growf SET timezone TO 'UTC';