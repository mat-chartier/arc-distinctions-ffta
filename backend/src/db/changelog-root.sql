--liquibase formatted sql

--changeset liquibase:1
CREATE TABLE arcdistinctions.archer (id bigserial primary key not null);
alter table arcdistinctions.archer add column no_licence text not null unique;
alter table arcdistinctions.archer add nom text not null;
alter table arcdistinctions.archer add prenom text not null;

CREATE table arcdistinctions.resultat(id bigserial primary key not null);
alter table arcdistinctions.resultat add column archer_id bigint not null references arcdistinctions.archer(id);
alter table arcdistinctions.resultat add column arme text not null;
alter table arcdistinctions.resultat add column score numeric(4) not null;
alter table arcdistinctions.resultat add column categorie text not null;
alter table arcdistinctions.resultat add column distance numeric not null;
alter table arcdistinctions.resultat add column blason text not null;
alter table arcdistinctions.resultat add column num_depart numeric(1) not null;
alter table arcdistinctions.resultat add column date_debut_concours timestamp not null;
alter table arcdistinctions.resultat add column saison numeric(4) not null;

--changeset liquibase:2
CREATE table arcdistinctions.distinction(id bigserial primary key not null);
alter table arcdistinctions.distinction add column archer_id bigint not null references arcdistinctions.archer(id);
alter table arcdistinctions.distinction add column nom text not null;
alter table arcdistinctions.distinction add column resultat_id bigint not null references arcdistinctions.resultat(id);
alter table arcdistinctions.distinction add column statut text not null;

--changeset liquibase:3
alter table arcdistinctions.archer add password text;
alter table arcdistinctions.archer add role text;

--changeset liquibase:4
alter table arcdistinctions.resultat add column discipline text not null default 'S';
alter table arcdistinctions.resultat alter column discipline drop default;
alter table arcdistinctions.resultat add column creation_date timestamp not null default now();

alter table arcdistinctions.distinction add column distance numeric not null default 18;
alter table arcdistinctions.distinction alter column distance drop default;

alter table arcdistinctions.distinction add column discipline text not null default 'Salle';
alter table arcdistinctions.distinction alter column discipline drop default;

-- Create a unique index on all columns of resultat table
create unique index resultat_unique_index on arcdistinctions.resultat (archer_id, arme, score, categorie, distance, blason, num_depart, date_debut_concours, saison, discipline);
