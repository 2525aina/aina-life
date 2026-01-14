# aina-life

大切なペットとの日々を記録する、モダンでおしゃれな生活日記アプリ

## 概要

aina-life は、ペットの日常を写真付きで記録できる日記アプリです。カレンダービューで過去の記録を振り返ったり、体重の推移をグラフで確認したりできます。

## 機能

| カテゴリ             | 機能概要                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 🔐 **認証**           | Google ログイン、プロフィール設定（ニックネーム、自己紹介、誕生日、性別）、テーマ・時刻表示形式の設定                                   |
| 🐾 **ペット管理**     | 複数ペット登録・切り替え、詳細情報（種類、品種、毛色、性別、誕生日、お迎え日）、アバター画像、マイクロチップ ID、医療メモ、かかりつけ医 |
| 👥 **ペット共有**     | メール招待、権限管理（オーナー / 編集者 / 閲覧者）、招待の承認・辞退・削除                                                              |
| 📔 **日記・予定**     | カテゴリタグ（ごはん、散歩、お薬、通院など）、カスタムタスク、時刻/時間範囲指定、複数画像、お散歩友達との紐付け、完了チェック           |
| 📅 **カレンダー**     | 月/週/日表示切り替え、過去の未完了予定表示                                                                                              |
| ⚖️ **体重管理**       | 体重記録（kg / g）、年次グラフ表示                                                                                                      |
| 🐕 **お散歩友達**     | 友達ペット登録、詳細情報（種類、品種、毛色、特徴、出会った場所・日時）、飼い主情報、複数画像、ソート機能                                |
| 📊 **ダッシュボード** | クイックアクション、タイムライン、過去の未完了予定                                                                                      |

## 技術スタック

| 項目           | 技術                        |
| -------------- | --------------------------- |
| フレームワーク | Next.js 16 (Static Export)  |
| 言語           | TypeScript                  |
| ホスティング   | Firebase Hosting            |
| 認証           | Firebase Auth               |
| データベース   | Firestore                   |
| ストレージ     | Firebase Storage            |
| UI ライブラリ  | shadcn/ui + Tailwind CSS v4 |
| アニメーション | Framer Motion               |
| グラフ         | Recharts                    |

## セットアップ

### 前提条件

- Node.js 22.x
- npm 10.x
- Firebase CLI

### インストール

```bash
# リポジトリをクローン
git clone git@github.com:2525aina/aina-life.git
cd aina-life

# 依存パッケージをインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集して Firebase の設定を追加
```

### 開発サーバー起動

Next.js の開発サーバーと Firebase Emulators を同時に起動する場合（推奨）：

```bash
# 開発サーバーとエミュレータを同時起動（データ永続化あり）
npm run dev:full
```

- Next.js: http://localhost:3000
- Emulator UI: http://localhost:4000

上記コマンドを実行すると、`firebase-data` ディレクトリにデータが保存され、次回起動時にもデータが引き継がれます（`Ctrl+C` で終了時に自動保存されます）。

エミュレータなしで Next.js のみ起動する場合：

```bash
npm run dev
```

### Node.js バージョン管理 (.nvmrc)

プロジェクトルートにある `.nvmrc` ファイルは、このプロジェクトで推奨される Node.js のバージョン（v22）を指定しています。
`nvm` (Node Version Manager) を導入している環境では、以下のコマンドを実行するだけで適切なバージョンに切り替わります。

```bash
nvm use
```

### ビルド

```bash
npm run build
```

`out/` ディレクトリに静的ファイルが生成されます。

### デプロイ

```bash
firebase deploy
```

## 環境変数

`.env.local` に以下の環境変数を設定してください：

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## ディレクトリ構成

```
aina-life/
├── src/
│   ├── app/                # Next.js App Router ページ
│   │   ├── dashboard/      # ダッシュボード
│   │   ├── calendar/       # カレンダー
│   │   ├── entry/          # 日記エントリー
│   │   ├── weight/         # 体重管理
│   │   ├── pets/           # ペット管理
│   │   └── profile/        # プロフィール
│   ├── components/
│   │   ├── features/       # 機能コンポーネント
│   │   └── ui/             # shadcn/ui コンポーネント
│   ├── contexts/           # React Context
│   ├── hooks/              # カスタムフック
│   └── lib/                # ユーティリティ
├── public/                 # 静的ファイル
├── firestore.rules         # Firestore セキュリティルール
├── storage.rules           # Storage セキュリティルール
└── firebase.json           # Firebase 設定
```

## Firebase コンソール設定

1. **Authentication**
   - Google プロバイダを有効化
   - 承認済みドメインに `aina-life.web.app` を追加

2. **Firestore**
   - データベースを作成（本番モード）
   - ルールをデプロイ: `firebase deploy --only firestore:rules`

3. **Storage**
   - バケットを作成
   - ルールをデプロイ: `firebase deploy --only storage`

## 開発ガイドライン

### コードの品質確認

変更を加えた後は、以下のコマンドを順に実行してください：

```bash
# フォーマット
npx prettier --write "src/**/*.{ts,tsx,css}"

# Lint
npm run lint

# ビルド
npm run build
```

### コミットメッセージ規約

コミットメッセージは以下の形式で記述してください：

```
[日本語プレフィックス] メッセージ

例:
[機能追加] ダッシュボードにグラフを追加
[バグ修正] カレンダーの日付表示を修正
[リファクタリング] 共通コンポーネントを分離
[ドキュメント] READMEを更新
[スタイル] フォーマット修正
[改善] パフォーマンスを最適化
```

## ライセンス

Private
