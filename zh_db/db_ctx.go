package zh_db

import (
	"context"
	"database/sql"
	"os"
	"time"

	"github.com/charmbracelet/log"
	_ "github.com/mattn/go-sqlite3"
)

type dbSingleTon struct {
	db *sql.DB
}

func DbInit() dbSingleTon {
	db, err := sql.Open("sqlite3", "./zh.db")
	if err != nil {
		log.Fatal("Failed to open db", err)
	}

	return dbSingleTon{
		db: db,
	}
}

// If dbPath does not exist mkdir and touch sqlite.db
func SqliteExist() {
	_, err := os.Stat("./zh.db")
	if os.IsNotExist(err) {
		file, err := os.Create("zh.db")
		if err != nil {
			log.Fatal("Couldnt make the sqlite file", err)
		}
		file.Close()
		log.Info("Sqlite file created")
		createTable()
	}
}

func createTable() {
	db, err := sql.Open("sqlite3", "zh.db")
	if err != nil {
		log.Fatal("Failed to open db", err)
	}
	defer db.Close()

	createTbl := `create table zh (id text primary key, link text, title text, article text, article_gen text, time_created text)`
	_, err = db.Exec(createTbl)
	if err != nil {
		log.Printf("%q: %s\n", err, createTbl)
		return
	}

	log.Info("Created table")
}

func (db *dbSingleTon) WriteToDisk(id string, link string, title string, article string, article_gen string) error {
	ctx := context.Background()

	queries := New(db.db)
	currTime := time.Now().Format(time.RFC3339)
	err := queries.CreateArticle(ctx, CreateArticleParams{
		ID:          id,
		Link:        link,
		Title:       title,
		Article:     article,
		ArticleGen:  article_gen,
		TimeCreated: currTime,
	})

	return err
}

func (db *dbSingleTon) FetchAllArticles() ([]Zh, error) {
	ctx := context.Background()
	queries := New(db.db)
	articles, err := queries.GetAll(ctx)
	if err != nil {
		log.Fatal("Unable to fetch articles from db")
		return []Zh{}, err
	}

	return articles, nil
}

func (db *dbSingleTon) GetById(id string) (Zh, error) {
	ctx := context.Background()

	queries := New(db.db)
	article, err := queries.GetById(ctx, id)
	if err != nil {
		log.Fatal("Unable to fetch query")
		return Zh{}, err
	}

	return article, nil
}

func (db *dbSingleTon) Duplicate(link string) bool {
	ctx := context.Background()
	queries := New(db.db)
	query, err := queries.FindArticle(ctx, link)
	if err != nil {
		log.Fatal(err)
	}

	if query == "TRUE" {
		return true
	}
	return false
}
