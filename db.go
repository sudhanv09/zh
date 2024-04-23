package main

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"os"
	"time"
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

func writeToDisk(link string, title string, article string, article_gen string) (bool, error) {
	db, err := sql.Open("sqlite3", "zh.db")
	if err != nil {
		log.Fatal("Couldnt open db", err)
		return false, err
	}
	write := `insert into zh (link, title, article, article_gen, time_created) values ( ?, ?, ?, ?, ?)`

	tx, err := db.Begin()
	if err != nil {
		log.Fatal("Couldnt begin transaction", err)
		return false, err
	}

	stmt, err := tx.Prepare(write)
	if err != nil {
		log.Fatal("Failed to prepare tx statement", err)
		return false, err
	}
	defer stmt.Close()

	currTime := time.Now().Format(time.RFC3339)
	_, err = stmt.Exec(link, title, article, article_gen, currTime)
	if err != nil {
		log.Fatal("Couldnt execute statement", err)
		return false, err
	}

	err = tx.Commit()
	if err != nil {
		log.Fatal("Couldnt commit transaction", err)
		return false, err
	}

	log.Println("Wrote to disk successfully")
	return true, nil
}

func fetchArticles() {}
