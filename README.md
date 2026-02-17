# NVD-RSS-feed

NVD (National Vulnerability Database) の CVE 情報を RSS 2.0 フィードとして自動生成・配信するツールです。GitHub Actions で1時間ごとに実行され、最新の脆弱性情報を GitHub Pages 上の RSS フィードとして公開します。

## 機能

- NVD API 2.0 から最新の CVE 情報を取得
- CVSS スコア・深刻度 (v4.0 / v3.1 / v3.0 / v2.0) を自動抽出してフィードに反映
- 既存フィードとの差分マージ・重複排除
- 最新100件を保持する RSS 2.0 フィードを生成
- GitHub Pages へ自動デプロイ

## セットアップ

### 前提条件

- Node.js 22+
- pnpm

### インストール

```bash
pnpm install
```

### 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `APIKEY` | いいえ | NVD API キー。設定するとレート制限が緩和されます (5 req/30s → 50 req/30s) |
| `GITHUB_REPOSITORY_OWNER` | はい | GitHub ユーザー名/Organization名。フィード URL の構築に使用されます |

NVD API キーは https://nvd.nist.gov/developers/request-an-api-key から取得できます。

ローカル実行時は `.env` ファイルに環境変数を設定できます。

### 実行

```bash
pnpm generate
```

`dist/feed.xml` に RSS フィードが出力されます。

## GitHub Actions による自動配信

`.github/workflows/generate-feed.yml` により、以下のタイミングで自動実行されます:

- **毎時0分** (cron スケジュール)
- **手動実行** (workflow_dispatch)

### リポジトリの設定

1. **NVD API キーの登録**: リポジトリの Settings > Secrets and variables > Actions に `NVD_API_KEY` を登録
2. **GitHub Pages の有効化**: Settings > Pages で Source を「GitHub Actions」または `gh-pages` ブランチに設定

設定後、`https://<ユーザー名>.github.io/NVD-RSS-feed/feed.xml` でフィードが公開されます。

## プロジェクト構成

```
src/
├── main.ts              # エントリーポイント
├── config.ts            # 設定・定数
├── nvd-client.ts        # NVD API クライアント
├── feed-generator.ts    # RSS フィード生成
├── feed-state.ts        # 既存フィードの状態管理
├── cvss.ts              # CVSS スコア抽出ユーティリティ
└── api/nvd/
    ├── contract.ts      # ts-rest API コントラクト定義
    └── cves/2.0/schema/
        ├── request.ts   # リクエストパラメータ型
        └── response.ts  # レスポンススキーマ (自動生成)
```

## 技術スタック

- **TypeScript** (ES2022, ESM)
- **ts-rest** - 型安全な REST API クライアント
- **feed** - RSS フィード生成
- **fast-xml-parser** - XML パース
- **zod** - ランタイムバリデーション
- **GitHub Actions** - CI/CD・自動実行
- **GitHub Pages** - フィード配信

## ライセンス

ISC
