package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
	"log"
	"os"
	"time"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Failed to load env file")
	}

	var rootCmd = &cobra.Command{
		Use:   "zh",
		Short: "Learn chinese by reading news articles",
	}

	var limit int
	var model string
	var runCmd = &cobra.Command{
		Use:   "run",
		Short: "Run the scraper and save the results",
		Run: func(cmd *cobra.Command, args []string) {
			app(limit, model)
		},
	}

	var listCmd = &cobra.Command{
		Use:   "ls",
		Short: "List all the articles saved",
		Run: func(cmd *cobra.Command, args []string) {
			res, _ := fetchAllArticles()
			fmt.Println(res)
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
	results := scraper(limit)

	for _, article := range results {
		if model == "gemini" {
			gemini, err := geminiGen(article.Content)
			if err != nil {
				log.Fatal("Failed to generate text from gemini")
			}

			c := retrieveResponse(gemini.Candidates[0].Content.Parts)
			err = writeToDisk(article.Link, article.Title, article.Content, c)
			if err != nil {
				log.Fatal("Write failed")
			}
			log.Printf("%s written to disk", article.Link)

		} else {
			gen := ollamaGen(article)
			time.Sleep(time.Second)
			err := writeToDisk(article.Link, article.Title, article.Content, gen.Response)
			if err != nil {
				log.Fatal("Write failed")
			}
			log.Printf("%s written to disk", article.Link)
		}

	}
}
