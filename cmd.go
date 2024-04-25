package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "zh",
	Short: "Learn chinese by reading news articles",
}

var runCmd = &cobra.Command{
	Use:   "run",
	Short: "Run the scraper and save the results",
	Run: func(cmd *cobra.Command, args []string) {
		app(limit)
	},
}

var limit int

var listCmd = &cobra.Command{
	Use:   "ls",
	Short: "List all the articles saved",
	Run: func(cmd *cobra.Command, args []string) {
		//fmt.Println("Listing")
		res, _ := fetchAllArticles()
		fmt.Println(res)
	},
}

func init() {
	rootCmd.AddCommand(listCmd)
	rootCmd.AddCommand(runCmd)

	runCmd.Flags().IntVarP(&limit, "limit", "l", 5, "Limit the amount of articles scraped.")
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
