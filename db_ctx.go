package main

import (
	"context"
	"database/sql"
	"log"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"

	"github.com/sudhanv09/zh/zh_db"
)

// If dbPath does not exist mkdir and touch sqlite.db
func sqliteExist() bool {
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

	return true
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

func writeToDisk(link string, title string, article string, article_gen string) error {
	ctx := context.Background()

	db, err := sql.Open("sqlite3", "zh.db")
	if err != nil {
		log.Fatal("Couldnt open db", err)
		return err
	}

	queries := zh_db.New(db)
	currTime := time.Now().Format(time.RFC3339)
	err = queries.CreateArticle(ctx, zh_db.CreateArticleParams{
		Link:        link,
		Title:       title,
		Article:     article,
		ArticleGen:  article_gen,
		TimeCreated: currTime,
	})

	return nil
}

func fetchAllArticles() ([]zh_db.Zh, error) {
	ctx := context.Background()
	db, err := sql.Open("sqlite3", "zh.db")
	if err != nil {
		log.Fatal("Couldnt open db", err)
		return []zh_db.Zh{}, err
	}
	defer db.Close()

	queries := zh_db.New(db)
	articles, err := queries.GetAll(ctx)
	if err != nil {
		log.Fatal("Unable to fetch articles from db")
		return []zh_db.Zh{}, err
	}

	return articles, nil
}

func getById(id int64) (zh_db.Zh, error) {
	ctx := context.Background()
	db, err := sql.Open("sqlite3", "zh.db")
	if err != nil {
		log.Fatal("Couldnt open db", err)
		return zh_db.Zh{}, err
	}
	defer db.Close()

	queries := zh_db.New(db)
	article, err := queries.GetById(ctx, id)
	if err != nil {
		log.Fatal("Unable to fetch query")
		return zh_db.Zh{}, err
	}

	return article, nil
}
