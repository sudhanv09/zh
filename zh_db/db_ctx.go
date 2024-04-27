package zh_db

import (
	"context"
	"database/sql"
	"log"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type dbSingleTon struct {
	db *sql.DB
}

func DbInit() dbSingleTon {
	db, err := sql.Open("sqlite3", "zh.db")
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
		log.Println("Sqlite file created")
		createTable()
	}

	return
}

func createTable() {
	db, err := sql.Open("sqlite3", "zh.db")
	if err != nil {
		log.Fatal("Failed to open db", err)
	}
	defer db.Close()

	createTbl := `create table zh (id integer primary key, link text, title text, article text, article_gen text, time_created text)`
	_, err = db.Exec(createTbl)
	if err != nil {
		log.Printf("%q: %s\n", err, createTbl)
		return
	}

	log.Println("Created table")
}

func (db *dbSingleTon) WriteToDisk(link string, title string, article string, article_gen string) error {
	ctx := context.Background()

	queries := New(db.db)
	currTime := time.Now().Format(time.RFC3339)
	err := queries.CreateArticle(ctx, CreateArticleParams{
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

func (db *dbSingleTon) GetById(id int64) (Zh, error) {
	ctx := context.Background()

	queries := New(db.db)
	article, err := queries.GetById(ctx, id)
	if err != nil {
		log.Fatal("Unable to fetch query")
		return Zh{}, err
	}

	return article, nil
}
