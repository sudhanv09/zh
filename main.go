package main

import (
	"fmt"
	"github.com/sudhanv09/zh/gen_models"
	"github.com/sudhanv09/zh/scrapers"
	"github.com/sudhanv09/zh/tui"
	"github.com/sudhanv09/zh/zh_db"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Failed to load env file")
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

	listCmd := &cobra.Command{
		Use:   "ls",
		Short: "List all the articles saved",
		Run: func(cmd *cobra.Command, args []string) {
			tui.UiInit()
		},
	}

	rootCmd.AddCommand(listCmd)
	rootCmd.AddCommand(runCmd)
	runCmd.Flags().IntVarP(&limit, "limit", "l", 5, "Limit the amount of articles scraped.")
	runCmd.Flags().StringVarP(&model, "model", "m", "ollama", "Choose the model to use.")
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func app(limit int, model string) {
	db := zh_db.DbInit()
	results := scrapers.TVBScraper(limit)

	for _, article := range results {
		var genString string
		if model == "gemini" {
			gemini, err := gen_models.GeminiGen(article.Content)
			if err != nil {
				log.Fatal("Failed to generate text from gemini")
			}
			genString = gen_models.RetrieveResponse(gemini.Candidates[0].Content.Parts)
		} else {
			genString = gen_models.OllamaGen(article).Response
		}

		err := db.WriteToDisk(article.Link, article.Title, article.Content, genString)
		if err != nil {
			log.Fatal("Write failed")
		}
		log.Printf("%s written to disk", article.Link)
	}
}
