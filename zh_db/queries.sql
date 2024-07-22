-- name: GetAll :many
select * from zh;

-- name: GetById :one
select * from zh
where id = ? limit 1;

-- name: CreateArticle :exec
insert into zh (id, link, title, article, article_gen, time_created) values ( ?, ?, ?, ?, ?, ?);

-- name: FindArticle :one
select 
    case
        when exists(
            select id from zh
            where link = ? limit 1
        )
        then 'true'
        else 'false'
end as is_present;
