package main

import (
	"fmt"
	"github.com/spf13/cobra"
	"os"
)

var rootCmd = &cobra.Command{
	Use:   "zh",
	Short: "Learn chinese by reading news articles",
}

var runCmd = &cobra.Command{
	Use:   "run",
	Short: "Run the scraper and save the results",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Running...")
	},
}

var listCmd = &cobra.Command{
	Use:   "ls",
	Short: "List all the articles saved",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("List articles")
	},
}

func init() {
	rootCmd.AddCommand(listCmd)
	rootCmd.AddCommand(runCmd)
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}