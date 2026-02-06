# a.s.ist コーポレートサイト — AI エージェント向けガイドライン

## プロジェクト概要

- **サイト**: https://www.a-s-ist.com/
- **ホスティング**: GitHub Pages（リポジトリ: `a-s-ist/a-s-ist.github.io`）
- **ブランチ運用**: `feature/moriguhi/contents-update` で作業 → main にマージ
- **ビルドツール**: なし（静的 HTML / CSS / JS のみ）
- **CSS**: `assets/solutions.css`（サイト全体で共有）
- **JS**: `assets/particle-flow.js`（パーティクルアニメーション）、`assets/hamburger-menu.js`（モバイルメニュー）

## ディレクトリ構成

```
/
├── index.html                  # トップページ
├── sitemap.xml                 # サイトマップ（更新必須）
├── robots.txt                  # クローラー設定
├── CNAME                       # カスタムドメイン設定
├── assets/
│   ├── solutions.css           # 共通CSS
│   ├── particle-flow.js        # パーティクルアニメーション
│   └── hamburger-menu.js       # ハンバーガーメニュー
├── image/                      # 画像ファイル
├── solutions/                  # ソリューション個別ページ
│   ├── index.html              # ソリューション一覧
│   ├── spectrum/
│   ├── anomaly-detection/
│   ├── report-automation/
│   └── algorithm-development/
├── cases/                      # 事例紹介ページ
├── news/                       # ニュース記事
│   └── category/               # ニュースカテゴリ
├── company/                    # 会社情報
├── members/                    # メンバー
├── contact/                    # お問い合わせ
├── privacy/                    # プライバシーポリシー
└── careers/                    # 採用情報
```

## 新しいページを作成したとき（必須チェックリスト）

### 1. Google Analytics タグを追加

`<head>` の先頭（`<html lang="ja">` の直後）に以下を追加する：

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6H4W7HWC57"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-6H4W7HWC57');
</script>
```

### 2. canonical タグを追加

`<link rel="stylesheet">` の直前に追加する。URL は `https://www.a-s-ist.com/` をベースにする：

```html
<link rel="canonical" href="https://www.a-s-ist.com/（ページのパス）" />
```

例: `solutions/spectrum/index.html` の場合 → `https://www.a-s-ist.com/solutions/spectrum/`

### 3. sitemap.xml を更新

`sitemap.xml` に新しいページの `<url>` エントリを追加する。priority の目安：

| ページ種別 | priority |
|-----------|----------|
| トップページ | 1.0 |
| ソリューション一覧 | 0.9 |
| ソリューション個別 | 0.8 |
| 事例紹介 | 0.7 |
| 会社情報・メンバー・問い合わせ | 0.7 |
| ニュース一覧 | 0.7 |
| ニュースカテゴリ | 0.5 |
| ニュース個別記事 | 0.5 |
| プライバシーポリシー | 0.3 |

### 4. ヘッダー・フッターを統一

既存ページのヘッダー・フッターをコピーして使う。パスの深さに応じて相対パス（`../`, `../../`）を調整する。

### 5. パーティクルアニメーション

各ページの `<body>` 直後に以下を含める：

```html
<canvas class="particle-canvas" data-particle-canvas aria-hidden="true"></canvas>
```

`</body>` の直前に以下のスクリプトを含める：

```html
<script src="（相対パス）/assets/particle-flow.js" defer></script>
<script src="（相対パス）/assets/hamburger-menu.js" defer></script>
```

## ページを削除したとき

- `sitemap.xml` から該当エントリを削除する
- 必要に応じて `robots.txt` に `Disallow` を追加する

## CSS の注意点

- 全ページ共通で `assets/solutions.css` を使用
- 画像には `img { border-radius: 16px; }` がグローバルに適用される。スクリーンショット等で角丸を外したい場合は `border-radius: 0;` を個別に指定する
- ヒーロータイトルのフォントサイズ: `clamp(1.5rem, 3.5vw, 2.75rem)`
- `.hero-line` は `display: block` で改行を表現する

## 画像

- 画像は `image/` ディレクトリに配置する
- 事例紹介のアイキャッチは `image/case-*.png` の命名規則
- ソリューションのアイキャッチは `image/solution-*.jpg` の命名規則
- クライアントロゴは `image/clients/` に配置（webp 形式）

## コミットメッセージ

日本語で記述。プレフィックスを使う：
- `feat:` 新機能・新ページ
- `fix:` バグ修正
- `docs:` ドキュメント変更
- `style:` デザイン・CSS変更

## ドメイン

- 本番URL: `https://www.a-s-ist.com/`
- GitHub Pages: `https://a-s-ist.github.io/`
- OGP画像やcanonicalのURLは `https://www.a-s-ist.com/` を使用する
