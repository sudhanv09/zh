package main

import "fmt"

func main() {

	a := scraper(2)

	for _, article := range a {
		t := getTranslation(article)

		evalTime := t.EvalCount / t.EvalDuration
		fmt.Println(t.Response)
		fmt.Printf("Token Gen Speed: %d\n", evalTime)
	}

	Execute()

}
