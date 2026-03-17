# ディレクトリ構造・ルーティング設計書

## 1. フロントエンドフレームワーク構成
本アプリケーションは **Next.js 16 (React 18)** によって構築され、ルーティング機構として **App Router** (`src/app/` ディレクトリベース) を利用しています。  
これにより、「レイアウト（`layout.tsx`）」によるUIの共通化や、機能ごとにクローズドなコンポーネント管理がしやすくなっています。

## 2. ディレクトリ構造

### 2.1 ルートレベルの構成
```text
aina-life/
├── src/                # アプリケーションコード本体
│   ├── app/            # ルーティングおよび各ページのUI
│   ├── components/     # 再利用可能なUI・ドメインコンポーネント群
│   ├── contexts/       # グローバル状態（Context Provider）
│   ├── hooks/          # データ操作・ビジネスロジック用 Custom Hooks
│   └── lib/            # Firebase 初期化、ユーティリティ関数、型定義等
├── public/             # PWA アイコンなどの静的アセット
├── firestore.rules     # データベース・セキュリティルール
└── storage.rules       # ファイルストレージ・セキュリティルール
```

### 2.2 `src/app/` (ルーティング) の構成詳細
App Router では、ファイル・フォルダ構造がそのまま URL パスとなり、`layout.tsx` 等の機能でナビゲーションがネストされます。

```text
src/app/
├── globals.css         # アプリ全体のグローバルスタイル・Tailwind エントリー
├── layout.tsx          # ヘッダー、ナビゲーションメニュー、Context Provider等の主要なラップUI
├── page.tsx            # ランディング・ホーム画面 (`/`)
│
├── dashboard/          # サマリー、直近の日記一覧など
│   └── page.tsx        # `/dashboard`
│
├── entry/              # 日記・スケジュールの作成・編集
│   ├── new/page.tsx    # 新規作成 `/entry/new`
│   └── [id]/page.tsx   # 既存の編集 `/entry/{id}`
│
├── pets/               # ペットの設定・メンバー管理
│   ├── new/page.tsx    # 新規ペット登録 `/pets/new`
│   └── [id]/           # 個別ペット詳細・招待等
│       └── page.tsx    # `/pets/{id}`
│
├── friends/            # お散歩友達リストと登録
│   ├── page.tsx        # 一覧表示 `/friends`
│   └── new/page.tsx    # 友達登録 `/friends/new`
│
├── weight/             # 体重推移・グラフ
│   └── page.tsx        # `/weight`
│
└── profile/            # ユーザー・プロフィール設定
    └── page.tsx        # `/profile`
```

## 3. コンポーネント設計思想 (`src/components/`)
コンポーネントは、再利用性の高さとドメイン固有のロジックに依存するかどうかで明確に分かれています。

### 3.1 `components/ui/`
* **前提**: `shadcn/ui` ベースのコンポーネント群。
* **特性**: デザインシステムの最小単位（ボタン、入力フォーム、ダイアログなど）。原則としてビジネスロジックを持たず、プロパティ（`props`）の受け渡しのみで見た目や挙動を決定します。  
*(例: Button, Input, Dialog, Select, Card)*

### 3.2 `components/features/`（またはドメイン固有）
* **前提**: 各機能領域（カレンダー、ペット、エントリーなど）に紐づくコンポーネント群。
* **特性**: UI を組み合わせた複合コンポーネントであり、内部で `hooks` を呼び出したり、Context（`PetContext`等）を参照したりと、ドメイン固有の状態管理を保持しています。  
*(例: CalendarView, EntryForm, WeightChart, PetSelector)*

## 4. ナビゲーションとレイアウト
* ルートの `layout.tsx` が、ページ全体のヘッダー、モバイル向けの下部ナビゲーションなどをラップし、ページ遷移が起きてもガタつきなく（全体リロードされずに）コンテンツ領域だけが切り替わる **SPA(Single Page Application)** 動作を実現しています。
* ルーティングには Next.js の `<Link href="...">` コンポーネントを使用し、ページロードの最適化を図っています。
