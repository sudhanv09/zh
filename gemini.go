package main

import (
	"context"
	"fmt"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
	"log"
	"os"
)

const gemini = "gemini-pro"

func geminiGen(content string) (*genai.GenerateContentResponse, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("GEMINI_API")))
	if err != nil {
		log.Fatal("Failed to init gemini", err)
		return nil, err
	}
	defer client.Close()

	model := client.GenerativeModel(gemini)

	genText := genai.Text(basePrompt + content)
	resp, err := model.GenerateContent(ctx, genText)
	if err != nil {
		log.Fatal("Failed to generate content", err)
		return nil, err
	}

	return resp, nil
}

func retrieveResponse(parts []genai.Part) string {
	var result string
	for _, part := range parts {
		result += fmt.Sprint(part)
	}
	return result
}
