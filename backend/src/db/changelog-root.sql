--liquibase formatted sql

--changeset liquibase:1
CREATE TABLE arcdistinctions.archer (id bigserial primary key not null);
alter table archer add column no_licence text not null unique;
alter table archer add nom text not null;
alter table archer add prenom text not null;

CREATE table arcdistinctions.resultat(id bigserial primary key not null);
alter table resultat add column archer_id bigint not null references arcdistinctions.archer(id);
alter table resultat add column arme text not null;
alter table resultat add column score numeric(4) not null;
alter table resultat add column categorie text not null;
alter table resultat add column distance numeric not null;
alter table resultat add column blason text not null;
alter table resultat add column num_depart numeric(1) not null;
alter table resultat add column date_debut_concours timestamp not null;
alter table resultat add column saison numeric(4) not null;

--changeset liquibase:2
CREATE table arcdistinctions.distinction(id bigserial primary key not null);
alter table distinction add column archer_id bigint not null references arcdistinctions.archer(id);
alter table distinction add column nom text not null;
alter table distinction add column resultat_id bigint not null references arcdistinctions.resultat(id);
alter table distinction add column statut text not null;


