// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: queries.sql

package zh_db

import (
	"context"
)

const createArticle = `-- name: CreateArticle :exec
insert into zh (link, title, article, article_gen, time_created) values ( ?, ?, ?, ?, ?)
`

type CreateArticleParams struct {
	Link        string
	Title       string
	Article     string
	ArticleGen  string
	TimeCreated string
}

func (q *Queries) CreateArticle(ctx context.Context, arg CreateArticleParams) error {
	_, err := q.db.ExecContext(ctx, createArticle,
		arg.Link,
		arg.Title,
		arg.Article,
		arg.ArticleGen,
		arg.TimeCreated,
	)
	return err
}

const getAll = `-- name: GetAll :many
select id, link, title, article, article_gen, time_created from zh
`

func (q *Queries) GetAll(ctx context.Context) ([]Zh, error) {
	rows, err := q.db.QueryContext(ctx, getAll)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Zh
	for rows.Next() {
		var i Zh
		if err := rows.Scan(
			&i.ID,
			&i.Link,
			&i.Title,
			&i.Article,
			&i.ArticleGen,
			&i.TimeCreated,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getById = `-- name: GetById :one
select id, link, title, article, article_gen, time_created from zh
where id = ? limit 1
`

func (q *Queries) GetById(ctx context.Context, id int64) (Zh, error) {
	row := q.db.QueryRowContext(ctx, getById, id)
	var i Zh
	err := row.Scan(
		&i.ID,
		&i.Link,
		&i.Title,
		&i.Article,
		&i.ArticleGen,
		&i.TimeCreated,
	)
	return i, err
}
