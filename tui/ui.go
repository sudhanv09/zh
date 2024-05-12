package tui

import (
	"fmt"
	"os"
	"strconv"

	"github.com/charmbracelet/bubbles/table"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/charmbracelet/log"
	"github.com/muesli/reflow/wordwrap"

	"github.com/sudhanv09/zh/zh_db"
)

var (
	baseStyle = lipgloss.NewStyle().
			BorderStyle(lipgloss.NormalBorder()).
			BorderForeground(lipgloss.Color("240")).
			Align(lipgloss.Center)

	titleStyle = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#710dc5"))
	dateStyle  = lipgloss.NewStyle().Foreground(lipgloss.Color("#686968")).PaddingBottom(2)
	// highlight  = lipgloss.NewStyle().Foreground(lipgloss.Color("#11d011"))
)

const maxWidth = 120

type model struct {
	table   table.Model
	chosen  bool
	article zh_db.Zh
	w, h    int
}

func (m model) Init() tea.Cmd { return nil }

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	db := zh_db.DbInit()
	var cmd tea.Cmd
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "esc":
			if m.table.Focused() {
				m.table.Blur()
			} else {
				m.table.Focus()
			}
		case "q", "ctrl+c":
			return m, tea.Quit
		case "enter":
			id, _ := strconv.ParseInt(m.table.SelectedRow()[0], 10, 64)
			article, err := db.GetById(id)
			if err != nil {
				log.Fatal("Failed to get the article")
				return m, tea.Quit
			}

			m.article = article
			m.chosen = true
		}

	case tea.WindowSizeMsg:
		m.w = msg.Width
		m.h = msg.Height
	}

	m.table, cmd = m.table.Update(msg)
	return m, cmd
}

func (m model) View() string {
	var renderStr string
	if m.chosen {
		s := fmt.Sprintf("%s\n%s\n\n  %s",
			titleStyle.Render(m.article.Title), dateStyle.Render(m.article.TimeCreated), m.article.ArticleGen)
		renderStr = wordwrap.String(s, min(m.w, maxWidth))
	} else {
		renderStr = baseStyle.Render(m.table.View()) + "\n"
	}
	return lipgloss.Place(m.w, m.h, lipgloss.Center, lipgloss.Center, renderStr)
}

func UiInit() {
	db := zh_db.DbInit()
	columns := []table.Column{
		{Title: "Id", Width: 4},
		{Title: "Title", Width: 20},
		{Title: "Article", Width: 30},
		{Title: "Created", Width: 25},
	}

	listArticles, _ := db.FetchAllArticles()

	var rows []table.Row
	for _, item := range listArticles {
		rows = append(rows, table.Row{
			strconv.FormatInt(item.ID, 10),
			item.Title,
			item.Article,
			item.TimeCreated,
		})
	}

	t := table.New(
		table.WithColumns(columns),
		table.WithRows(rows),
		table.WithFocused(true),
		table.WithHeight(15),
	)

	s := table.DefaultStyles()
	s.Header = s.Header.
		BorderStyle(lipgloss.NormalBorder()).
		BorderForeground(lipgloss.Color("240")).
		BorderBottom(true).
		Bold(false)
	s.Selected = s.Selected.
		Foreground(lipgloss.Color("229")).
		Background(lipgloss.Color("57")).
		Bold(false)
	t.SetStyles(s)

	m := model{table: t}
	if _, err := tea.NewProgram(m, tea.WithAltScreen(), tea.WithMouseCellMotion()).Run(); err != nil {
		fmt.Println("Error running program:", err)
		os.Exit(1)
	}
}
