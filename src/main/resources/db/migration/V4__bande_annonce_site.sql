alter table film
    add column bande_annonce_site varchar(32) null after bande_annonce_cle;

update film
set bande_annonce_site = 'Dailymotion',
    bande_annonce_cle  = 'x6b8o8'
where titre = 'Le Voyage de Chihiro';

update film
set bande_annonce_site = 'Dailymotion',
    bande_annonce_cle  = 'x7qbvmz'
where titre = 'Parasite';

update film
set bande_annonce_site = 'Dailymotion',
    bande_annonce_cle  = 'x2lbyj4'
where titre = 'Inception';

update film
set bande_annonce_site = 'Dailymotion',
    bande_annonce_cle  = 'x8kmr7u'
where titre = 'Dune : Deuxième Partie';

update film
set bande_annonce_site = 'Dailymotion',
    bande_annonce_cle  = 'x8gga47'
where titre = 'Oppenheimer';

update film
set bande_annonce_site = 'Dailymotion',
    bande_annonce_cle  = 'x293tv2'
where titre = 'Interstellar';

update film
set bande_annonce_site = 'YouTube'
where bande_annonce_cle is not null
  and bande_annonce_site is null;
