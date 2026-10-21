insert into film (titre, genre, duree_minutes, date_sortie)
values ('Le Voyage de Chihiro', 'Animation', 125, '2001-04-20'),
       ('Parasite', 'Thriller', 132, '2019-05-30'),
       ('La Haine', 'Drame', 98, '1995-05-31');

insert into salle (nom, capacite)
values ('Salle Lumière', 120),
       ('Salle Méliès', 60);

insert into seance (film_id, salle_id, debut, prix_unitaire)
select f.id, s.id, date_add(now(), interval 1 day), 9.90
from film f
         join salle s on s.nom = 'Salle Lumière'
where f.titre = 'Parasite';

insert into seance (film_id, salle_id, debut, prix_unitaire)
select f.id, s.id, date_add(now(), interval 1 day), 7.50
from film f
         join salle s on s.nom = 'Salle Méliès'
where f.titre = 'Le Voyage de Chihiro';

insert into seance (film_id, salle_id, debut, prix_unitaire)
select f.id, s.id, date_add(now(), interval 2 day), 8.20
from film f
         join salle s on s.nom = 'Salle Lumière'
where f.titre = 'La Haine';
