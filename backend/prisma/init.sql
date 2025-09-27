-- GROWF Production Database Initialization
-- This file is executed when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (handled by POSTGRES_DB environment variable)
-- The database 'growf_prod' will be created automatically by Docker

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Basic database configuration for production
ALTER DATABASE growf_prod SET timezone TO 'UTC';
ALTER DATABASE growf_prod SET log_statement TO 'all';
ALTER DATABASE growf_prod SET log_min_duration_statement TO 1000;

-- Performance optimizations
ALTER DATABASE growf_prod SET shared_preload_libraries TO 'pg_stat_statements';
ALTER DATABASE growf_prod SET max_connections TO 200;
ALTER DATABASE growf_prod SET shared_buffers TO '256MB';
ALTER DATABASE growf_prod SET effective_cache_size TO '1GB';
ALTER DATABASE growf_prod SET work_mem TO '4MB';
ALTER DATABASE growf_prod SET maintenance_work_mem TO '64MB';
ALTER DATABASE growf_prod SET checkpoint_completion_target TO 0.9;
ALTER DATABASE growf_prod SET wal_buffers TO '16MB';
ALTER DATABASE growf_prod SET default_statistics_target TO 100;

-- Security settings
ALTER DATABASE growf_prod SET log_connections TO 'on';
ALTER DATABASE growf_prod SET log_disconnections TO 'on';
ALTER DATABASE growf_prod SET log_checkpoints TO 'on';
ALTER DATABASE growf_prod SET log_lock_waits TO 'on';