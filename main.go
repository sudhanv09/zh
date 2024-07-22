package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/a-h/templ"
	"github.com/charmbracelet/log"
	"github.com/joho/godotenv"
	gonanoid "github.com/matoous/go-nanoid"
	"github.com/spf13/cobra"

	"github.com/sudhanv09/zh/gen_models"
	"github.com/sudhanv09/zh/scrapers"
	"github.com/sudhanv09/zh/view"
	"github.com/sudhanv09/zh/zh_db"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Warn("No env file found. Can't use gemini without API keys")
	}

	zh_db.SqliteExist()

	rootCmd := &cobra.Command{
		Use:   "zh",
		Short: "Learn chinese by reading news articles",
	}

	var limit int
	var model string
	runCmd := &cobra.Command{
		Use:   "run",
		Short: "Run the scraper and save the results",
		Run: func(cmd *cobra.Command, args []string) {
			app(limit, model)
		},
	}

	serveCmd := &cobra.Command{
		Use:   "serve",
		Short: "Start zh server",
		Run: func(cmd *cobra.Command, args []string) {
			server()
		},
	}

	rootCmd.AddCommand(runCmd)
	rootCmd.AddCommand(serveCmd)
	runCmd.Flags().IntVarP(&limit, "limit", "l", 10, "Limit the amount of articles scraped.")
	runCmd.Flags().StringVarP(&model, "model", "m", "gemini", "Choose the model to use.")
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func server() {
	db := zh_db.DbInit()
	articles, _ := db.FetchAllArticles()

	index := view.Index(articles)

	http.Handle("/", templ.Handler(index))
	http.HandleFunc("/read/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		articleId, _ := db.GetById(id)
		read := view.Read(articleId)
		read.Render(r.Context(), w)
	})

	fmt.Println("Starting web server on port 3000")
	http.ListenAndServe(":3000", nil)
}

func app(limit int, model string) {
	db := zh_db.DbInit()
	results := scrapers.TVBScraper(limit)

	log.Info("Starting Generation")
	for _, article := range results {
		if db.Duplicate(article.Link) {
			log.Info("Duplicate article found. Skipping...", "link", article.Link)
			break
		}

		var genString string
		if model == "gemini" {
			gemini, err := gen_models.GeminiGen(article.Content)
			if err != nil {
				log.Error("Failed to generate text from gemini")
			}
			genString = gen_models.RetrieveResponse(gemini.Candidates[0].Content.Parts)
		} else {
			genString = gen_models.OllamaGen(article).Response
		}

		id, _ := gonanoid.Generate(
			"abcdefghijklmniopqrstuvwxyz1234567890",
			8,
		)

		err := db.WriteToDisk(id, article.Link, article.Title, article.Content, genString)
		if err != nil {
			log.Error("Write failed", err)
		} else {
			log.Info("writing to disk", "url", article.Link)
		}
	}
}
