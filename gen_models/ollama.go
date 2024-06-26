package gen_models

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/charmbracelet/log"

	"github.com/sudhanv09/zh/scrapers"
)

type OllamaRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	Stream bool   `json:"stream"`
}

type OllamaResponse struct {
	Model              string `json:"model,omitempty"`
	Created            string `json:"created_at,omitempty"`
	Response           string `json:"response"`
	Done               bool   `json:"done,omitempty"`
	Context            []int  `json:"context"`
	TotalDuration      int64  `json:"total_duration,omitempty"`
	LoadDuration       int64  `json:"load_duration,omitempty"`
	PromptEvalDuration int64  `json:"prompt_eval_duration,omitempty"`
	EvalCount          int64  `json:"eval_count,omitempty"`
	EvalDuration       int64  `json:"eval_duration,omitempty"`
}

const (
	Wizard = "wizardlm2:7b-q4_K_M"
	Qwen   = "qwen2:latest"
	Phi    = "phi3:latest"
	LLama3 = "llama3:latest"

	ollamaApi  string = "http://localhost:11434/api/generate"
	basePrompt string = "Translate the text to pinyin."
)

func OllamaGen(article scrapers.ScrapedResult) OllamaResponse {
	var ollamaResp OllamaResponse
	articleContent := strings.ReplaceAll(article.Content, "\t", "")
	articleContent = strings.ReplaceAll(articleContent, "\n", "")

	ollamaReq := OllamaRequest{Model: LLama3, Prompt: basePrompt + articleContent, Stream: false}
	reqJson, err := json.Marshal(ollamaReq)
	if err != nil {
		log.Fatal("Couldnt Marshal into ollama request", err)
	}

	respBody, err := postReq(reqJson)
	if err != nil {
		log.Fatal("Post request failed", err)
		return OllamaResponse{}
	}

	if err := json.NewDecoder(respBody).Decode(&ollamaResp); err != nil {
		log.Fatal("Decode failed ", err)
	}
	return ollamaResp
}

func postReq(body []byte) (io.Reader, error) {
	req, err := http.NewRequest("POST", ollamaApi, bytes.NewBuffer(body))
	if err != nil {
		log.Fatal("Couldnt make the POST request ", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal("Couldnt make request")
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("http request failed: %d", resp.StatusCode)
	}

	return resp.Body, nil
}
