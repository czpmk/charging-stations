create table sessions
(
    id          integer generated always as identity
        primary key,
    user_id     integer     not null,
    expiry_date timestamp   not null,
    token       varchar(64) not null
);

alter table sessions
    owner to postgres;

INSERT INTO public.sessions (user_id, expiry_date, token) VALUES (12, '2022-01-19 13:13:50.000000', 'e690e62a76b84302b9c0621e90bfcd2d');
INSERT INTO public.sessions (user_id, expiry_date, token) VALUES (11, '2022-01-24 11:10:13.000000', 'fb10134e91ae47d3b24de22361217e65');
