alter table film
    add column affiche_url varchar(512) null after date_sortie,
    add column bandeau_url varchar(512) null after affiche_url,
    add column bande_annonce_cle varchar(32) null after bandeau_url,
    add column synopsis text null after bande_annonce_cle,
    add column note decimal(3, 1) null after synopsis;

alter table reservation
    add column client_username varchar(80) null after email_client;

create index idx_reservation_client on reservation (client_username, statut);

update film
set affiche_url         = 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    bandeau_url         = 'https://image.tmdb.org/t/p/w1280/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    bande_annonce_cle   = 'ByXuk9QqQkk',
    synopsis            = 'Chihiro, une fillette de dix ans, se retrouve piégée dans un monde peuplé d''esprits après la transformation de ses parents en porcs. Elle devra travailler dans les bains publics de Yubaba pour retrouver sa liberté.',
    note                = 8.6
where titre = 'Le Voyage de Chihiro';

update film
set affiche_url         = 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    bandeau_url         = 'https://image.tmdb.org/t/p/w1280/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    bande_annonce_cle   = '5xH0HfJHsaY',
    synopsis            = 'Toute la famille de Ki-taek est au chômage. Lorsque le fils parvient à se faire engager comme précepteur chez les Park, une famille aisée, les quatre membres vont s''infiltrer un à un dans leur maison.',
    note                = 8.5
where titre = 'Parasite';

update film
set titre             = 'Inception',
    genre             = 'Science-fiction',
    duree_minutes     = 148,
    date_sortie       = '2010-07-16',
    affiche_url       = 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    bandeau_url       = 'https://image.tmdb.org/t/p/w1280/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    bande_annonce_cle = 'YoHD9XEInc0',
    synopsis          = 'Dom Cobb est un voleur expérimenté, capable de s''introduire dans les rêves pour en extraire des secrets. Sa dernière mission : implanter une idée dans l''esprit d''un héritier.',
    note              = 8.4
where id = 3;

insert into film (titre, genre, duree_minutes, date_sortie, affiche_url, bandeau_url, bande_annonce_cle, synopsis, note)
values ('Dune : Deuxième Partie', 'Science-fiction', 166, '2024-02-28',
        'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        'https://image.tmdb.org/t/p/w1280/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        'Way9Dexny3w',
        'Paul Atréides s''unit aux Fremen pour mener la révolte contre la maison Harkonnen et venger sa famille, tout en tentant d''éviter le futur tragique qu''il entrevoit.',
        8.2),
       ('Oppenheimer', 'Drame', 180, '2023-07-19',
        'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        'https://image.tmdb.org/t/p/w1280/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        'uYPbbksJxIg',
        'Le parcours de J. Robert Oppenheimer, physicien à la tête du projet Manhattan, et les conséquences politiques et morales de la bombe atomique.',
        8.1),
       ('Interstellar', 'Science-fiction', 169, '2014-11-05',
        'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        'https://image.tmdb.org/t/p/w1280/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        'zSWdZVtXT7E',
        'Alors que la Terre se meurt, une équipe d''explorateurs franchit un trou de ver pour trouver une nouvelle planète habitable et sauver l''humanité.',
        8.7);

insert into seance (film_id, salle_id, debut, prix_unitaire)
select f.id, s.id, date_add(now(), interval 3 day), 11.50
from film f
         join salle s on s.nom = 'Salle Lumière'
where f.titre = 'Dune : Deuxième Partie';

insert into seance (film_id, salle_id, debut, prix_unitaire)
select f.id, s.id, date_add(now(), interval 4 day), 10.90
from film f
         join salle s on s.nom = 'Salle Méliès'
where f.titre = 'Oppenheimer';

insert into seance (film_id, salle_id, debut, prix_unitaire)
select f.id, s.id, date_add(now(), interval 5 day), 9.90
from film f
         join salle s on s.nom = 'Salle Lumière'
where f.titre = 'Interstellar';

update reservation set client_username = 'client' where client_username is null;
