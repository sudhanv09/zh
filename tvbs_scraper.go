package main

import (
	"fmt"
	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
	"time"
)

type ScrapedResult struct {
	Title   string
	Content string
	Link    string
	Time    time.Time
}

func scraper(limit int) []ScrapedResult {
	c := colly.NewCollector()
	articleScraper := c.Clone()

	scrapedArticles := make([]ScrapedResult, 0, 200)

	c.OnHTML("div.news_now2", func(e *colly.HTMLElement) {
		articles := e.DOM.Find(".list ul li")
		articles.Each(func(_ int, s *goquery.Selection) {
			if limit <= 0 {
				return
			}

			articleLink := s.Find("a").First()
			link, _ := articleLink.Attr("href")
			articleScraper.Visit(e.Request.AbsoluteURL(link))

			limit--
		})
	})

	articleScraper.OnHTML("article", func(el *colly.HTMLElement) {
		title := el.DOM.Find("h1.title").Text()
		body := el.DOM.Find("div.article_content")

		content := body.Find("p").First().Text()
		rest := body.Children().Remove().End().Text()

		articles := ScrapedResult{
			Title:   title,
			Content: content + rest,
			Link:    el.Request.URL.String(),
			Time:    time.Now(),
		}

		scrapedArticles = append(scrapedArticles, articles)
	})

	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL.String())
	})

	articleScraper.OnRequest(func(request *colly.Request) {
		fmt.Println("Scraping article", request.URL.String())
	})

	c.Visit("https://news.tvbs.com.tw/politics")

	return scrapedArticles
}
