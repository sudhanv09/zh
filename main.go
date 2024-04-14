package main

import (
	"fmt"
	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
)

func main() {
	c := colly.NewCollector()
	articleScraper := c.Clone()

	scrapeArticles := 0

	c.OnHTML("div.news_now2", func(e *colly.HTMLElement) {
		articles := e.DOM.Find(".list ul li")
		articles.Each(func(_ int, s *goquery.Selection) {
			if scrapeArticles >= 6 {
				return
			}

			articleLink := s.Find("a").First()
			link, _ := articleLink.Attr("href")
			articleScraper.Visit(e.Request.AbsoluteURL(link))

			scrapeArticles++
		})
	})

	articleScraper.OnHTML("div.article_content", func(el *colly.HTMLElement) {
		news := el.DOM.Find("p").First()
		//text := el.Text
		fmt.Println(news.Text())

	})

	c.OnRequest(func(r *colly.Request) {
		fmt.Println("visiting", r.URL.String())
	})

	articleScraper.OnRequest(func(request *colly.Request) {
		fmt.Println("Article", request.URL.String())
	})

	c.Visit("https://news.tvbs.com.tw/politics")
}
