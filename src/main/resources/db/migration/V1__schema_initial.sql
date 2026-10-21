create table film
(
    id            bigint       not null auto_increment,
    titre         varchar(200) not null,
    genre         varchar(80)  not null,
    duree_minutes int          not null,
    date_sortie   date         not null,
    primary key (id),
    constraint ck_film_duree check (duree_minutes between 40 and 300)
) engine = InnoDB
  default charset = utf8mb4
  collate = utf8mb4_0900_ai_ci;

create index idx_film_titre on film (titre);
create index idx_film_genre on film (genre);

create table salle
(
    id       bigint       not null auto_increment,
    nom      varchar(120) not null,
    capacite int          not null,
    primary key (id),
    constraint uk_salle_nom unique (nom),
    constraint ck_salle_capacite check (capacite between 20 and 500)
) engine = InnoDB
  default charset = utf8mb4
  collate = utf8mb4_0900_ai_ci;

create table seance
(
    id            bigint         not null auto_increment,
    film_id       bigint         not null,
    salle_id      bigint         not null,
    debut         datetime(6)    not null,
    prix_unitaire decimal(8, 2)  not null,
    primary key (id),
    constraint fk_seance_film foreign key (film_id) references film (id) on delete restrict,
    constraint fk_seance_salle foreign key (salle_id) references salle (id) on delete restrict,
    constraint ck_seance_prix check (prix_unitaire > 0)
) engine = InnoDB
  default charset = utf8mb4
  collate = utf8mb4_0900_ai_ci;

create index idx_seance_debut on seance (debut);
create index idx_seance_salle_debut on seance (salle_id, debut);

create table reservation
(
    id            bigint       not null auto_increment,
    code          varchar(20)  not null,
    seance_id     bigint       not null,
    email_client  varchar(254) not null,
    nombre_places int          not null,
    statut        varchar(20)  not null,
    creee_le      datetime(6)  not null,
    primary key (id),
    constraint uk_reservation_code unique (code),
    constraint fk_reservation_seance foreign key (seance_id) references seance (id) on delete restrict,
    constraint ck_reservation_places check (nombre_places between 1 and 8),
    constraint ck_reservation_statut check (statut in ('CONFIRMEE', 'ANNULEE'))
) engine = InnoDB
  default charset = utf8mb4
  collate = utf8mb4_0900_ai_ci;

create index idx_reservation_seance_statut on reservation (seance_id, statut);
create index idx_reservation_email on reservation (email_client);
