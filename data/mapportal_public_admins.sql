create table admins
(
    id      serial
        constraint admins_pk
            primary key,
    user_id integer not null
);

alter table admins
    owner to postgres;

create unique index admins_id_uindex
    on admins (id);

create unique index admins_user_id_uindex
    on admins (user_id);

INSERT INTO public.admins (id, user_id) VALUES (1, 11);
