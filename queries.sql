-- name: GetAll :one
select * from zh;

-- name: GetById :one
select * from zh
where id = ? limit 1;

-- name: CreateArticle :exec
insert into zh (link, title, article, article_gen, time_created) values ( ?, ?, ?, ?, ?);
