--liquibase formatted sql

--changeset liquibase:1
CREATE TABLE arcdistinctions.archer (id bigserial primary key not null);
alter table archer add column no_licence text not null unique;
