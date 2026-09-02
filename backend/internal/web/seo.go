package web

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"encoding/xml"
	htmlpkg "html"
	"net/http"
	"net/url"
	pathpkg "path"
	"regexp"
	"strings"
)

const (
	defaultSiteName      = "Sub2API"
	homeTitle            = "GPT API 中转与 OpenAI 国内直连"
	homeDescription      = "国内直连的 GPT API 与 OpenAI 兼容接口中转服务，支持 GPT、Codex 等大模型统一接入、按量计费、无需信用卡，并提供清晰的 Token 用量与费用明细。"
	homeKeywords         = "GPT API 中转, OpenAI API 中转, 大模型 API 中转, GPT 中转站, 国内直连 API, OpenAI 兼容接口, AI API 按量计费, 无需信用卡 API"
	docsTitle            = "GPT 与 OpenAI API 中文接入文档"
	docsDescription      = "GPT 与 OpenAI API 中文接入教程，涵盖 API Key、Base URL、Responses API、Chat Completions、Codex、模型调用、流式输出与费用查询。"
	docsKeywords         = "GPT API 接入教程, OpenAI API 中文文档, Responses API 文档, Chat Completions 接口, Codex API, API Key 教程, 大模型 API 文档"
	indexRobotsContent   = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
	noindexRobotsContent = "noindex, nofollow"
)

var (
	titleElementPattern = regexp.MustCompile(`(?is)<title(?:\s[^>]*)?>.*?</title>`)
	metaTagPatterns     = map[string]*regexp.Regexp{
		"description":         regexp.MustCompile(`(?is)<meta\s+[^>]*name=["']description["'][^>]*>`),
		"keywords":            regexp.MustCompile(`(?is)<meta\s+[^>]*name=["']keywords["'][^>]*>`),
		"robots":              regexp.MustCompile(`(?is)<meta\s+[^>]*name=["']robots["'][^>]*>`),
		"og:title":            regexp.MustCompile(`(?is)<meta\s+[^>]*property=["']og:title["'][^>]*>`),
		"og:description":      regexp.MustCompile(`(?is)<meta\s+[^>]*property=["']og:description["'][^>]*>`),
		"og:url":              regexp.MustCompile(`(?is)<meta\s+[^>]*property=["']og:url["'][^>]*>`),
		"og:type":             regexp.MustCompile(`(?is)<meta\s+[^>]*property=["']og:type["'][^>]*>`),
		"og:site_name":        regexp.MustCompile(`(?is)<meta\s+[^>]*property=["']og:site_name["'][^>]*>`),
		"og:image":            regexp.MustCompile(`(?is)<meta\s+[^>]*property=["']og:image["'][^>]*>`),
		"twitter:card":        regexp.MustCompile(`(?is)<meta\s+[^>]*name=["']twitter:card["'][^>]*>`),
		"twitter:title":       regexp.MustCompile(`(?is)<meta\s+[^>]*name=["']twitter:title["'][^>]*>`),
		"twitter:description": regexp.MustCompile(`(?is)<meta\s+[^>]*name=["']twitter:description["'][^>]*>`),
		"twitter:image":       regexp.MustCompile(`(?is)<meta\s+[^>]*name=["']twitter:image["'][^>]*>`),
	}
	canonicalLinkPattern = regexp.MustCompile(`(?is)<link\s+[^>]*rel=["']canonical["'][^>]*>`)
	seoJSONLDPattern     = regexp.MustCompile(`(?is)<script\s+[^>]*data-seo-jsonld(?:=["'][^"']*["'])?[^>]*>.*?</script>`)
	headClosePattern     = regexp.MustCompile(`(?i)</head>`)
)

type siteSEOSettings struct {
	SiteName           string
	SiteSubtitle       string
	SiteLogo           string
	BackendModeEnabled bool
}

type routeSEO struct {
	Title         string
	Description   string
	Keywords      string
	CanonicalPath string
	Robots        string
	Indexable     bool
	Known         bool
	Status        int
}

func defaultSiteSEOSettings() siteSEOSettings {
	return siteSEOSettings{SiteName: defaultSiteName}
}

func parseSiteSEOSettings(settingsJSON []byte) siteSEOSettings {
	var raw struct {
		SiteName           string `json:"site_name"`
		SiteSubtitle       string `json:"site_subtitle"`
		SiteLogo           string `json:"site_logo"`
		BackendModeEnabled bool   `json:"backend_mode_enabled"`
	}
	_ = json.Unmarshal(settingsJSON, &raw)

	raw.SiteName = strings.TrimSpace(raw.SiteName)
	if raw.SiteName == "" {
		raw.SiteName = defaultSiteName
	}

	return siteSEOSettings{
		SiteName:           raw.SiteName,
		SiteSubtitle:       strings.TrimSpace(raw.SiteSubtitle),
		SiteLogo:           strings.TrimSpace(raw.SiteLogo),
		BackendModeEnabled: raw.BackendModeEnabled,
	}
}

func normalizeSPAPath(requestPath string) string {
	if separator := strings.IndexAny(requestPath, "?#"); separator >= 0 {
		requestPath = requestPath[:separator]
	}
	cleaned := pathpkg.Clean("/" + strings.TrimSpace(requestPath))
	if cleaned == "." {
		return "/"
	}
	return cleaned
}

func routeSEOForPath(requestPath string, settings siteSEOSettings) routeSEO {
	requestPath = normalizeSPAPath(requestPath)
	siteName := strings.TrimSpace(settings.SiteName)
	if siteName == "" {
		siteName = defaultSiteName
	}

	meta := routeSEO{
		Title:       siteName,
		Description: preferredSiteDescription(settings),
		Robots:      noindexRobotsContent,
		Known:       isKnownSPAPath(requestPath),
		Status:      http.StatusOK,
	}
	if !meta.Known {
		meta.Title = "404 Not Found - " + siteName
		meta.Status = http.StatusNotFound
		return meta
	}

	if settings.BackendModeEnabled {
		return meta
	}

	switch requestPath {
	case "/":
		meta.Title = homeTitle + " - " + siteName
		meta.Keywords = homeKeywords
		meta.CanonicalPath = "/"
		meta.Robots = indexRobotsContent
		meta.Indexable = true
	case "/docs":
		meta.Title = docsTitle + " - " + siteName
		meta.Description = docsDescription
		meta.Keywords = docsKeywords
		meta.CanonicalPath = "/docs"
		meta.Robots = indexRobotsContent
		meta.Indexable = true
	}

	return meta
}

func preferredSiteDescription(settings siteSEOSettings) string {
	subtitle := strings.TrimSpace(settings.SiteSubtitle)
	siteName := strings.TrimSpace(settings.SiteName)
	if subtitle == "" || strings.EqualFold(subtitle, siteName) {
		return homeDescription
	}
	return subtitle
}

func isKnownSPAPath(requestPath string) bool {
	requestPath = normalizeSPAPath(requestPath)
	switch requestPath {
	case "/",
		"/setup",
		"/docs",
		"/login",
		"/register",
		"/email-verify",
		"/auth/callback",
		"/auth/oauth/callback",
		"/auth/linuxdo/callback",
		"/auth/wechat/callback",
		"/auth/wechat/payment/callback",
		"/auth/dingtalk/callback",
		"/auth/dingtalk/email-completion",
		"/auth/oidc/callback",
		"/forgot-password",
		"/reset-password",
		"/key-usage",
		"/dashboard",
		"/keys",
		"/batch-image",
		"/docs/batch-image",
		"/usage",
		"/redeem",
		"/affiliate",
		"/available-channels",
		"/profile",
		"/subscriptions",
		"/purchase",
		"/orders",
		"/payment/qrcode",
		"/payment/result",
		"/payment/stripe",
		"/payment/airwallex",
		"/payment/stripe-popup",
		"/admin",
		"/admin/dashboard",
		"/admin/ops",
		"/admin/audit-logs",
		"/admin/users",
		"/admin/groups",
		"/admin/channels",
		"/admin/channels/pricing",
		"/admin/channels/monitor",
		"/monitor",
		"/admin/subscriptions",
		"/admin/accounts",
		"/admin/announcements",
		"/admin/proxies",
		"/admin/redeem",
		"/admin/promo-codes",
		"/admin/settings",
		"/admin/risk-control",
		"/admin/prompt-audit",
		"/admin/usage",
		"/admin/affiliates",
		"/admin/affiliates/invites",
		"/admin/affiliates/rebates",
		"/admin/affiliates/transfers",
		"/admin/orders/dashboard",
		"/admin/orders",
		"/admin/orders/plans":
		return true
	}

	return hasSinglePathParameter(requestPath, "/legal/") ||
		hasSinglePathParameter(requestPath, "/custom/")
}

func hasSinglePathParameter(requestPath, prefix string) bool {
	if !strings.HasPrefix(requestPath, prefix) {
		return false
	}
	param := strings.TrimPrefix(requestPath, prefix)
	return param != "" && !strings.Contains(param, "/")
}

func publicRequestBaseURL(request *http.Request) string {
	if request == nil {
		return ""
	}

	scheme := "http"
	if request.TLS != nil {
		scheme = "https"
	} else if forwarded := strings.ToLower(strings.TrimSpace(strings.Split(request.Header.Get("X-Forwarded-Proto"), ",")[0])); forwarded == "http" || forwarded == "https" {
		scheme = forwarded
	}

	host := strings.TrimSpace(request.Host)
	if host == "" {
		return ""
	}

	return (&url.URL{Scheme: scheme, Host: host}).String()
}

func absolutePublicURL(baseURL, requestPath string) string {
	baseURL = strings.TrimRight(strings.TrimSpace(baseURL), "/")
	if baseURL == "" {
		return ""
	}
	return baseURL + normalizeSPAPath(requestPath)
}

func publicImageURL(baseURL, configuredLogo string) string {
	configuredLogo = strings.TrimSpace(configuredLogo)
	if configuredLogo != "" {
		if parsed, err := url.Parse(configuredLogo); err == nil && (parsed.Scheme == "http" || parsed.Scheme == "https") && parsed.Host != "" {
			return parsed.String()
		}
		if strings.HasPrefix(configuredLogo, "/") && !strings.HasPrefix(configuredLogo, "//") {
			return strings.TrimRight(baseURL, "/") + configuredLogo
		}
	}
	if baseURL == "" {
		return "/logo.svg"
	}
	return strings.TrimRight(baseURL, "/") + "/logo.svg"
}

func renderRouteSEO(html []byte, meta routeSEO, settings siteSEOSettings, baseURL, nonce string) []byte {
	title := meta.Title
	description := meta.Description
	canonicalURL := ""
	if meta.CanonicalPath != "" {
		canonicalURL = absolutePublicURL(baseURL, meta.CanonicalPath)
	}
	imageURL := publicImageURL(baseURL, settings.SiteLogo)

	html = replaceTitle(html, title)
	html = upsertMetaTag(html, "description", description, false)
	if meta.Indexable && meta.Keywords != "" {
		html = upsertMetaTag(html, "keywords", meta.Keywords, false)
	} else {
		html = metaTagPatterns["keywords"].ReplaceAll(html, nil)
	}
	html = upsertMetaTag(html, "robots", meta.Robots, false)
	html = upsertMetaTag(html, "og:title", title, true)
	html = upsertMetaTag(html, "og:description", description, true)
	html = upsertMetaTag(html, "og:type", "website", true)
	html = upsertMetaTag(html, "og:site_name", settings.SiteName, true)
	html = upsertMetaTag(html, "og:image", imageURL, true)
	html = upsertMetaTag(html, "twitter:card", "summary", false)
	html = upsertMetaTag(html, "twitter:title", title, false)
	html = upsertMetaTag(html, "twitter:description", description, false)
	html = upsertMetaTag(html, "twitter:image", imageURL, false)

	if canonicalURL == "" {
		html = canonicalLinkPattern.ReplaceAll(html, nil)
		html = metaTagPatterns["og:url"].ReplaceAll(html, nil)
	} else {
		html = upsertCanonicalLink(html, canonicalURL)
		html = upsertMetaTag(html, "og:url", canonicalURL, true)
	}

	html = seoJSONLDPattern.ReplaceAll(html, nil)
	if meta.Indexable && meta.CanonicalPath == "/" {
		html = injectWebSiteStructuredData(html, settings, canonicalURL, imageURL, nonce)
	}

	return html
}

func replaceTitle(html []byte, title string) []byte {
	tag := []byte("<title>" + htmlpkg.EscapeString(title) + "</title>")
	if titleElementPattern.Match(html) {
		return titleElementPattern.ReplaceAllFunc(html, func([]byte) []byte { return tag })
	}
	return injectBeforeHeadClose(html, tag)
}

func upsertMetaTag(html []byte, key, content string, property bool) []byte {
	attribute := "name"
	if property {
		attribute = "property"
	}
	tag := []byte(`<meta ` + attribute + `="` + htmlpkg.EscapeString(key) + `" content="` + htmlpkg.EscapeString(content) + `" data-seo-managed />`)
	if pattern := metaTagPatterns[key]; pattern != nil && pattern.Match(html) {
		return pattern.ReplaceAllFunc(html, func([]byte) []byte { return tag })
	}
	return injectBeforeHeadClose(html, tag)
}

func upsertCanonicalLink(html []byte, canonicalURL string) []byte {
	tag := []byte(`<link rel="canonical" href="` + htmlpkg.EscapeString(canonicalURL) + `" data-seo-managed />`)
	if canonicalLinkPattern.Match(html) {
		return canonicalLinkPattern.ReplaceAllFunc(html, func([]byte) []byte { return tag })
	}
	return injectBeforeHeadClose(html, tag)
}

func injectWebSiteStructuredData(html []byte, settings siteSEOSettings, canonicalURL, imageURL, nonce string) []byte {
	payload := map[string]any{
		"@context":    "https://schema.org",
		"@type":       "WebSite",
		"name":        settings.SiteName,
		"url":         canonicalURL,
		"description": preferredSiteDescription(settings),
		"inLanguage":  "zh-CN",
	}
	if imageURL != "" {
		payload["image"] = imageURL
	}
	encoded, err := json.Marshal(payload)
	if err != nil {
		return html
	}

	tag := []byte(`<script type="application/ld+json" data-seo-jsonld nonce="` +
		htmlpkg.EscapeString(nonce) + `">` + string(encoded) + `</script>`)
	return injectBeforeHeadClose(html, tag)
}

func injectBeforeHeadClose(html, tag []byte) []byte {
	location := headClosePattern.FindIndex(html)
	if location == nil {
		return html
	}
	var result bytes.Buffer
	result.Grow(len(html) + len(tag) + 1)
	result.Write(html[:location[0]])
	result.Write(tag)
	result.WriteByte('\n')
	result.Write(html[location[0]:])
	return result.Bytes()
}

func routeETag(baseETag, baseURL, requestPath string, status int) string {
	sum := sha256.Sum256([]byte(baseETag + "\x00" + baseURL + "\x00" + normalizeSPAPath(requestPath) + "\x00" + http.StatusText(status)))
	return `"` + hex.EncodeToString(sum[:12]) + `"`
}

func robotsText(baseURL string, backendModeEnabled bool) []byte {
	if backendModeEnabled {
		return []byte("User-agent: *\nDisallow: /\n")
	}

	var result strings.Builder
	result.WriteString("User-agent: *\n")
	result.WriteString("Allow: /\n")
	for _, privatePath := range []string{
		"/admin/",
		"/auth/",
		"/setup",
		"/login",
		"/register",
		"/email-verify",
		"/forgot-password",
		"/reset-password",
		"/key-usage",
		"/dashboard",
		"/keys",
		"/batch-image",
		"/usage",
		"/redeem",
		"/affiliate",
		"/available-channels",
		"/profile",
		"/subscriptions",
		"/purchase",
		"/orders",
		"/payment/",
		"/custom/",
		"/monitor",
	} {
		result.WriteString("Disallow: ")
		result.WriteString(privatePath)
		result.WriteByte('\n')
	}
	if strings.TrimSpace(baseURL) != "" {
		result.WriteString("Sitemap: ")
		result.WriteString(strings.TrimRight(baseURL, "/"))
		result.WriteString("/sitemap.xml\n")
	}
	return []byte(result.String())
}

type sitemapURLSet struct {
	XMLName xml.Name     `xml:"urlset"`
	XMLNS   string       `xml:"xmlns,attr"`
	URLs    []sitemapURL `xml:"url"`
}

type sitemapURL struct {
	Location string `xml:"loc"`
}

func sitemapXML(baseURL string, backendModeEnabled bool) []byte {
	urlSet := sitemapURLSet{
		XMLNS: "http://www.sitemaps.org/schemas/sitemap/0.9",
	}
	if !backendModeEnabled && strings.TrimSpace(baseURL) != "" {
		urlSet.URLs = []sitemapURL{
			{Location: absolutePublicURL(baseURL, "/")},
			{Location: absolutePublicURL(baseURL, "/docs")},
		}
	}

	encoded, err := xml.MarshalIndent(urlSet, "", "  ")
	if err != nil {
		return []byte(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`)
	}
	return append([]byte(xml.Header), encoded...)
}
