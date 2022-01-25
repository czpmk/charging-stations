create table users
(
    id       serial
        primary key,
    email    varchar(60) not null,
    password varchar(64) not null
);

alter table users
    owner to postgres;

INSERT INTO public.users (id, email, password) VALUES (1, 'ala@makota.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b111');
INSERT INTO public.users (id, email, password) VALUES (2, 's123456@student.pg.edu.pl', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b222');
INSERT INTO public.users (id, email, password) VALUES (3, 's234567@student.pg.edu.pl', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b333');
INSERT INTO public.users (id, email, password) VALUES (4, 's244567@student.pg.edu.pl', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b444');
INSERT INTO public.users (id, email, password) VALUES (5, 's334567@student.pg.edu.pl', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b555');
INSERT INTO public.users (id, email, password) VALUES (6, 's234561@student.pg.edu.pl', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b666');
INSERT INTO public.users (id, email, password) VALUES (7, 's234527@student.pg.edu.pl', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b777');
INSERT INTO public.users (id, email, password) VALUES (8, 's234367@student.pg.edu.pl', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b888');
INSERT INTO public.users (id, email, password) VALUES (9, 's234467@student.pg.edu.pl', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b999');
INSERT INTO public.users (id, email, password) VALUES (10, 's534567@student.pg.edu.pl', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b110');
INSERT INTO public.users (id, email, password) VALUES (12, 'nowy@student.pg.edu.pl', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
INSERT INTO public.users (id, email, password) VALUES (11, 'adam@adminski.com', 'abe31fe1a2113e7e8bf174164515802806d388cf4f394cceace7341a182271ab');
INSERT INTO public.users (id, email, password) VALUES (13, 'nowy1@student.pg.edu.pl', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
INSERT INTO public.users (id, email, password) VALUES (14, 'nowy2@student.pg.edu.pl', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
INSERT INTO public.users (id, email, password) VALUES (15, 's156221@student.pg.edu.pl', '2901254d47991850b794510d2228f7d97c57ca0cf022901c7d1ee251585c2988');
