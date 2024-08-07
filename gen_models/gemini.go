package gen_models

import (
	"context"
	"fmt"
	"os"

	"github.com/charmbracelet/log"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

const gemini = "gemini-pro"

func GeminiGen(content string) (*genai.GenerateContentResponse, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("GEMINI_API")))
	if err != nil {
		log.Fatal("Gemini API keys not found. Visit https://ai.google.dev/gemini-api/docs/api-key.", err)
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

func RetrieveResponse(parts []genai.Part) string {
	var result string
	for _, part := range parts {
		result += fmt.Sprint(part)
	}
	return result
}
