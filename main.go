package main

import (
	"log"
	"time"
)

func main() {
	Execute()
}

func app(limit int) {
	results := scraper(limit)

	for _, article := range results {
		gen := getTranslation(article)
		time.Sleep(time.Second)
		_, err := writeToDisk(article.Link, article.Title, article.Content, gen.Response)
		if err != nil {
			log.Fatal("Write failed")
		}
		log.Printf("%s written to disk", article.Link)
	}
}
