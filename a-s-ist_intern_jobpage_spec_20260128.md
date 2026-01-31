# (株)a.s.ist 求人ページ（インターン募集）— GitHub Pages 開発仕様書
更新日: **2026-01-28**  
対象: **(株)a.s.ist 公式サイト（https://www.a-s-ist.com/）の求人ページとして公開することを想定**  

> 本仕様書は、**GitHub Pages 上で公開する単独の求人ページ**（採用応募導線あり）を、**見やすく・モダンな印象**に仕上げるための要件と実装ガイドをまとめたもの。  
> (株)a.s.ist は「東京大学発スタートアップとして、学術研究で使われる最先端の解析技術を社会実装」し、製造業の研究開発〜異常検知まで課題解決を掲げている文脈に整合させる。参考: 公式サイトトップの記載（要旨）。  

---

## 0. 前提・制約

### 0.1 ホスティング
- **GitHub Pages（静的ホスティング）**で公開する。
- 注意: GitHub Pages は「オンラインビジネス、eコマース、商用SaaS提供」を主目的とした無料ホスティング用途は想定されない（規約・運用上の注意あり）。本ページは**求人・情報提供サイト**に限定して運用する。  
- 注意: パスワードやクレジットカード等の「センシティブな取引」を扱うべきではない。応募情報の収集は **Googleフォーム**へ委譲し、Pages 側では個人情報を保持しない。  

### 0.2 運用条件
- 更新頻度: **月1回程度**
- 更新担当: **エンジニアのみ**
- 言語: **日本語のみ**
- 目的/CTA: **採用応募（Googleフォーム）**、（補助）サービス理解促進

---

## 1. 目的・KPI（計測設計の骨子）

### 1.1 Primary KPI
- **応募フォーム遷移（クリックCV）**: 「応募する」ボタンクリック数 / クリック率

### 1.2 Secondary KPI
- スクロール到達率（例: 「仕事内容」「必須条件」「選考フロー」「FAQ」）
- 重要セクションの閲覧（目次クリックなど）

> 計測は GA4（推奨: GTM経由）で実装。まずは **CTAクリック** を CV として固め、必要に応じて詳細イベントを追加する（更新頻度が低い前提に適合）。

---

## 2. 情報設計（IA / コンテンツ構成）

### 2.1 URL設計
- 推奨: `/{careers}/intern-20260128/`（更新日入りで履歴を残す）
- 任意: `/{careers}/intern/` を「最新版」にして常に最新へ誘導（リダイレクト or 内容を最新化）

### 2.2 セクション構成（上から順）
1. Hero（募集タイトル + 一言 + 更新日 + CTA）
2. 募集サマリー（時給 / 勤務地 / 働き方 / 応募リンク）
3. a.s.istが大事にしていること
4. 仕事内容
5. 必須条件 / 歓迎条件
6. 勤務条件（時給・勤務地・勤務時間）
7. 選考フロー
8. FAQ（応募前の不安を先回りで解消）
9. 会社情報（公式サイトへの導線を明確に）
10. プライバシー（応募情報はGoogleフォームで扱う旨を明記）
11. フッター（会社名・リンク）

### 2.3 ナビゲーション
- **アンカー目次（Sticky）**: `#values #work #requirements #conditions #process #faq`
- モバイルは上部に「目次」ボタン（タップで展開）でOK

---

## 3. デザイン要件（見やすい・モダン・公式サイトの求人として整合）

### 3.1 トーン
- **テック・研究開発の信頼感**（余白、整ったタイポグラフィ、控えめな装飾）
- 公式サイトに合わせた「硬すぎないが、誠実で論理的」な語り口

### 3.2 ビジュアル・UIパターン
- 1カラム主体 +（PCのみ）右サイドに**サマリーカード（Sticky）**
- CTAはページ上部と末尾に必ず配置（少なくとも2回）
- 箇条書き中心で、1文を短くする（読みやすさ優先）
- セクション間はカード/区切り線で視認性確保

### 3.3 ブランド整合
- 色/フォントは**公式サイトのトークンに寄せる**（CSSを確認して採用）
- ロゴ・OGP画像・faviconは可能なら公式アセットを流用（権限/著作確認の上）

---

## 4. 技術要件（GitHub Pages）

### 4.1 推奨スタック
- SSG: **Astro**（静的出力が容易、GitHub Pages デプロイガイドが公式にある）
- CSS: Tailwind CSS など（運用しやすいトークン設計）
- JavaScript: 最小（目次の開閉、スムーススクロール、CTA固定など）

### 4.2 デプロイ方式
- **GitHub Actions → GitHub Pages** で build → artifact → deploy
- Permissions: `pages: write` と `id-token: write` を付与（Actionsの要件）

### 4.3 コンテンツ管理
- 募集要項は **Markdown（MD/MDX）** で管理（更新頻度が低い前提に適合）
- 更新日、時給、勤務地、応募URLなどは **Frontmatter** もしくは JSON に切り出して差分更新しやすくする

---

## 5. SEO要件（最低限）

### 5.1 メタ
- `title`: `【インターン募集】(株)a.s.ist｜データ解析・LLM・強化学習・ラボオートメーション`
- `description`: 「仕事内容」「勤務地（柏の葉/リモート可）」「応募導線」を含む 100〜140字目安
- `canonical`: 公開URL

### 5.2 OGP
- `og:title` `og:description` `og:image` `og:url`
- `twitter:card=summary_large_image`

### 5.3 求人構造化データ（JobPosting）
- Google しごと検索向けに **JobPosting（JSON-LD）** を埋め込む（本仕様書末尾に完成例を記載）。
- 重要:
  - `title` は職務名のみ（給与/場所/日付/会社名を混ぜない）
  - `jobLocation.address.addressCountry` を含める
  - 時給は `baseSalary` の `unitText="HOUR"` を使用  
  - 完全リモートの場合は `jobLocationType="TELECOMMUTE"` が必須だが、今回は「柏の葉／リモート」なので**完全リモート扱いにしない**（誤記を避ける）

---

## 6. アクセシビリティ要件（最低限）
- 見出し階層（H1→H2→H3）を崩さない
- クリック可能要素はキーボード操作可能（フォーカス可視）
- ボタン文言は行動が明確（例: 「応募フォームへ進む」）
- コントラストは十分に（本文の可読性優先）

---

# A. 実際のページ文章（読みやすい日本語に整形 / Markdown原稿）
以下は **そのまま MD/MDX に貼り付けて使える**形の原稿案。

> 置換すべき値（公開URL、GTM/GAのID、OGP画像パスなど）は `TODO:` として残す。

---

## A-1. ページ本文（MD/MDX）

---
title: "インターン募集"
updatedAt: "2026-01-28"
companyName: "株式会社 a.s.ist"
companyUrl: "https://www.a-s-ist.com/"
applyUrl: "https://docs.google.com/forms/d/1LQRRtjoQtyXTjMc27xaBYuOqyJduSbWk5yH6sf1MwGk/edit"
locationText: "千葉県柏市柏の葉５丁目４−６ 東葛テクノプラザ／リモート可"
workStyle: "フレックスタイム"
salaryText: "時給 1,500円〜（応相談）※現在の全体平均：2,000円"
---

# インターン募集
**更新日：2026年1月28日**

a.s.ist は、学術研究で使われている最先端の解析技術を社会実装し、製造業の研究開発から製造工程の異常検知まで、幅広い課題解決に取り組む東京大学発スタートアップです。  
本募集では、データ解析・LLM・強化学習・ラボオートメーションなど、研究開発と実装の両面に関わるインターンを募集します。

---

## 応募はこちら（Googleフォーム）
- **応募フォーム**: [ご連絡フォーム（Googleフォーム）](https://docs.google.com/forms/d/1LQRRtjoQtyXTjMc27xaBYuOqyJduSbWk5yH6sf1MwGk/edit)
- 公式サイト: [株式会社 a.s.ist](https://www.a-s-ist.com/)

> **ポイント**  
> まずは「話を聞いてみたい」段階でも歓迎です。フォームから気軽に連絡ください。

---

## 募集サマリー
- **職種**：インターン
- **時給**：{{salaryText}}
- **勤務地**：{{locationText}}
- **勤務時間**：{{workStyle}}
- **応募**：[応募フォームへ進む](https://docs.google.com/forms/d/1LQRRtjoQtyXTjMc27xaBYuOqyJduSbWk5yH6sf1MwGk/edit)

---

## a.s.istが大事にしていること
- 制約のもとで最善の技術を探索・構築する
- 「精度」だけでなく、なぜそう言えるか（解釈性・説明可能性）まで含めて考える

---

## 仕事内容
以下のいずれか、または複数を担当します（適性・希望に応じて調整）。

- センサーデータ／実験データの解析アルゴリズムの構築
- LLMを用いたシステム開発
- ラボオートメーションのための強化学習モデルの開発
- マイコンを用いたハードウェア開発、研究など

---

## 必須条件
- プログラミング経験

---

## 歓迎条件
- チームで何か取り組んだ経験
- Pythonを用いた開発経験
- 機械学習・数理最適化・システム開発の基本知識
- 学術論文の投稿

---

## 勤務条件
### 時給
- {{salaryText}}

### 勤務場所
- {{locationText}}

### 勤務時間
- {{workStyle}}

---

## 選考フロー
1. カジュアル面談
2. 面談

---

## FAQ
### Q. リモート勤務は可能ですか？
- 可能です。業務内容や進め方に応じて、出社（柏の葉）とリモートを調整します。

### Q. 週あたりの稼働時間の目安はありますか？
- フレックスタイムのため相談の上で決定します。学業・研究との両立を前提に調整します。

### Q. 応募後の流れは？
- フォーム送信後、内容を確認し、カジュアル面談の案内をします。

---

## 会社情報
- 会社名：株式会社 a.s.ist  
- 公式サイト：https://www.a-s-ist.com/

---

## プライバシーについて（応募情報）
応募フォーム（Googleフォーム）に入力された情報は、選考・連絡の目的で使用します。  
本ページ（GitHub Pages）自体では、応募者の個人情報を収集・保存しません。

---

## 応募はこちら（再掲）
**[応募フォームへ進む](https://docs.google.com/forms/d/1LQRRtjoQtyXTjMc27xaBYuOqyJduSbWk5yH6sf1MwGk/edit)**

---

# B. JobPosting JSON-LD（この募集内容を埋めた完成形）
以下は、ページの `<head>` もしくは本文末尾に埋め込む **完成形の例**。  
`description` は **ページの記載内容と齟齬が出ないよう**、更新時は必ず合わせること。

> 注意: 「柏の葉／リモート可」のため、完全リモート（`jobLocationType=TELECOMMUTE` 必須）としては扱わない。

```json
{
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  "title": "インターン（データ解析・LLM・強化学習・ラボオートメーション）",
  "description": "<p>a.s.istは、学術研究で使われる最先端の解析技術を社会実装し、製造業の研究開発から製造工程の異常検知まで幅広い課題解決に取り組むスタートアップです。本募集では、データ解析・LLM・強化学習・ラボオートメーション等に関わるインターンを募集します。</p><h3>仕事内容</h3><ul><li>センサーデータ／実験データの解析アルゴリズムの構築</li><li>LLMを用いたシステム開発</li><li>ラボオートメーションのための強化学習モデルの開発</li><li>マイコンを用いたハードウェア開発、研究など</li></ul><h3>必須条件</h3><ul><li>プログラミング経験</li></ul><h3>歓迎条件</h3><ul><li>チームで何か取り組んだ経験</li><li>Pythonを用いた開発経験</li><li>機械学習・数理最適化・システム開発の基本知識</li><li>学術論文の投稿</li></ul><h3>勤務条件</h3><p>時給：1,500円〜（応相談）※現在の全体平均：2,000円<br/>勤務地：千葉県柏市柏の葉5丁目4-6 東葛テクノプラザ／リモート可<br/>勤務時間：フレックスタイム</p><h3>選考フロー</h3><ol><li>カジュアル面談</li><li>面談</li></ol><p>応募：Googleフォームよりご連絡ください。</p>",
  "identifier": {
    "@type": "PropertyValue",
    "name": "a.s.ist-intern",
    "value": "intern-20260128"
  },
  "datePosted": "2026-01-28",
  "employmentType": "INTERN",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "株式会社 a.s.ist",
    "sameAs": "https://www.a-s-ist.com/"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "柏の葉5丁目4-6 東葛テクノプラザ",
      "addressLocality": "柏市",
      "addressRegion": "千葉県",
      "addressCountry": "JP"
    }
  },
  "workHours": "フレックスタイム",
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "JPY",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 1500,
      "unitText": "HOUR"
    }
  },
  "directApply": true,
  "url": "TODO: 公開後の求人ページURL（canonicalと一致させる）",
  "applicationContact": {
    "@type": "ContactPoint",
    "url": "https://docs.google.com/forms/d/1LQRRtjoQtyXTjMc27xaBYuOqyJduSbWk5yH6sf1MwGk/edit",
    "contactType": "recruiting"
  }
}
```

---

## C. 実装チェックリスト（公開前）
- [ ] Hero と末尾に CTA がある（応募フォームへ到達できる）
- [ ] 目次で主要セクションへジャンプできる
- [ ] `title/description/OGP/canonical` が設定されている
- [ ] JobPosting の `title` が職務名のみ（給与・場所・会社名・日付を含めない）
- [ ] JobPosting の `jobLocation.address.addressCountry` を含む
- [ ] `baseSalary.value.unitText` が `HOUR`（大文字小文字が一致）
- [ ] 応募リンクは別タブ推奨（外部フォーム）
- [ ] 見出し階層が正しい（H1→H2→H3）

---

## D. 将来拡張（任意）
- 画像（OGP/ヒーロー）を公式サイトのトーンに合わせて制作・配置
- `validThrough` を設定し、募集終了時の取り下げを自動化
- 導入事例/技術ブログ/サービス紹介への導線を追加（ただし求人のCTAを弱めない）
