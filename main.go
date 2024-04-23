package main

import "log"

func main() {

	results := scraper(2)

	for _, article := range results {
		gen := getTranslation(article)
		_, err := writeToDisk(article.Link, article.Title, article.Content, gen.Response)
		if err != nil {
			log.Fatal("Write failed")
		}
	}
}
