package main

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/a-h/templ"
	"github.com/charmbracelet/log"
	"github.com/joho/godotenv"
	"github.com/spf13/cobra"

	"github.com/sudhanv09/zh/gen_models"
	"github.com/sudhanv09/zh/scrapers"
	"github.com/sudhanv09/zh/tui"
	"github.com/sudhanv09/zh/view"
	"github.com/sudhanv09/zh/zh_db"
)

func main() {
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

	listCmd := &cobra.Command{
		Use:   "ls",
		Short: "List all the articles saved",
		Run: func(cmd *cobra.Command, args []string) {
			tui.UiInit()
		},
	}

	serveCmd := &cobra.Command{
		Use:   "serve",
		Short: "Start zh server",
		Run: func(cmd *cobra.Command, args []string) {
			server()
		},
	}

	rootCmd.AddCommand(listCmd)
	rootCmd.AddCommand(runCmd)
	rootCmd.AddCommand(serveCmd)
	runCmd.Flags().IntVarP(&limit, "limit", "l", 5, "Limit the amount of articles scraped.")
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
		id, _ := strconv.ParseInt(r.PathValue("id"), 10, 64)
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
		var genString string
		if model == "gemini" {
			err := godotenv.Load()
			if err != nil {
				log.Fatal("Gemini API keys not found. Visit https://ai.google.dev/gemini-api/docs/api-key.")
			}

			gemini, err := gen_models.GeminiGen(article.Content)
			if err != nil {
				log.Error("Failed to generate text from gemini")
			}
			genString = gen_models.RetrieveResponse(gemini.Candidates[0].Content.Parts)
		} else {
			genString = gen_models.OllamaGen(article).Response
		}

		err := db.WriteToDisk(article.Link, article.Title, article.Content, genString)
		if err != nil {
			log.Error("Write failed")
		}
		log.Info("%s written to disk", article.Link)
	}
}
