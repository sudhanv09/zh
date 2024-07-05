package scrapers

import (
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/charmbracelet/log"
	"github.com/gocolly/colly"
)

type ScrapedResult struct {
	Title   string
	Content string
	Link    string
	Time    time.Time
}

func TVBScraper(limit int) []ScrapedResult {
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
		contentCleaned := cleanUp(content)

		rest := body.Children().Remove().End().Text()
		restCleaned := cleanUp(rest)

		final := contentCleaned + restCleaned
		articles := ScrapedResult{
			Title:   title,
			Content: final,
			Link:    el.Request.URL.String(),
			Time:    time.Now(),
		}

		scrapedArticles = append(scrapedArticles, articles)
	})

	c.OnRequest(func(r *colly.Request) {
		log.Info("Visiting", "url", r.URL.String())
	})

	articleScraper.OnRequest(func(request *colly.Request) {
		log.Info("Scraping article", "url", request.URL.String())
	})

	c.Visit("https://news.tvbs.com.tw/politics")

	return scrapedArticles
}

func cleanUp(s string) string {
	clean := strings.ReplaceAll(s, "\t", " ")
	clean = strings.ReplaceAll(clean, "\n", " ")
	clean = strings.ReplaceAll(clean, "\u00a0", "")
	return clean
}
