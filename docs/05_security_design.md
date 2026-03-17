# セキュリティ・権限管理設計書

## 1. セキュリティアーキテクチャの基本
aina-life は、ビジネスロジックを実行する独自のバックエンドサーバー（API）を持ちません。クライアントサイドから直接 Firebase リソース（Firestore, Storage）へデータを読み書きします。
したがって、システムのセキュリティは実質的に **Firestore Security Rules** および **Storage Security Rules** によって完全に保護・担保される設計となっています。

## 2. 認証 (Authentication)
* ユーザー認証には **Firebase Authentication (Google 認証)** を利用します。
* 認証セッショントークンは、Firebase クライアント SDK が自動的にローカルで管理（Refresh / Auth State Observer）します。
* セキュリティルール上では、リクエスト元のユーザー情報（UID等）は `request.auth` オブジェクトから安全に取得・検証されます。

## 3. アクセス制御と権限モデル (`firestore.rules`)

データへのアクセス制御は、「ペット単位のテナント」という概念を軸に、**自立したルールセット**として設計されています。

### 3.1 共通権限検証（Helper Functions）
ルールの煩雑さを防ぎ一貫性を保つため、以下のヘルパー関数による基本的なデータバリデーションを行っています。

| 関数名              | チェック内容                                          | 利用シーン                                       |
| ------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `isAuthenticated()` | `request.auth != null`                                | すべての操作の基本条件                           |
| `isOwner(userId)`   | `request.auth.uid == userId`                          | 個人のプロフィール (`users/{userId}`) 等の更新時 |
| `hasValidCreator()` | `request.resource.data.createdBy == request.auth.uid` | 新規ドキュメント登録時（なりすまし防止）         |
| `hasValidUpdater()` | `request.resource.data.updatedBy == request.auth.uid` | ドキュメント更新時                               |

### 3.2 ペットデータへのアクセス権（共有・マルチテナント）
ペットのデータ（日記、体重、タスク等）はすべて `pets/{petId}/...` 配下に保存されます。
この領域に対する読み書き権限は、リクエスト送信者が「そのペットのメンバーであるか？」によって判定されます。

**メンバーの判定ロジック (`isPetMember(petId)`)**
```javascript
function isPetMember(petId) {
  return isAuthenticated() && exists(/databases/$(database)/documents/pets/$(petId)/members/$(request.auth.uid));
}
```
* **堅牢なロールベース管理**: 単なる「配列の中にUIDが含まれているか」ではなく、`pets/{petId}/members/` サブコレクションに**自身の UID に合致するドキュメントが存在するか（`exists`）**をクエリすることで判定しています。

#### サブコレクションごとの制限事項
* **`entries`, `weights`, `tasks`, `friends` など**
  * `read`, `create`, `update`, `delete` 全てにおいて `isPetMember()` の条件を必須としています。共有メンバーであれば閲覧・編集が可能です（※細かなRoleである `editor/viewer` の制御はフロントエンド側で補完しています）。
* **集約コレクション (`entry_months`, `weight_years`)**
  * これらの削除操作は通常発生しませんが、もし発生した場合でもメンバーであれば許可しています。
* **`members` サブコレクション自体**
  * ペットを作成した本人（Owner/Creator）のみが削除（メンバーのキック）可能。
  * 自身が招待を受け入れる（Update）ことや、自身が退出する（Delete）ことは可能。

## 4. ファイルストレージ (`storage.rules`)
Firestore と同様に、ファイル（主に画像）についても認証とテナントベースでアクセスを制御します。現在のアプローチは以下のいずれか（または両方）の組み合わせで行われます。

* **パスベースの保護**: アップロードするファイルのパスに `petId` や `userId` を含め、ストレージ側で `request.auth.uid` がそのパスへの書き込みを許可されているかをルールで判定。
* **拡張子・サイズ制限**: 画像以外のファイルのアップロードを制限し、ファイルサイズに対する上限ルール（例：`request.resource.size < 5 * 1024 * 1024` = 5MB）を設けています。

## 5. アタックベクトルの予防
* **CSRF / XSS**: SPA構成かつFirebase SDKを利用するため、標準的なRESTによるCSRFの脅威は低いです（SDKが独自のリクエスト形式・トークンヘッダを用いるため）。Next.jsおよびReactによるDOMへのサニタイズにてXSS脆弱性を防いでいます。
* **不正データ注入**: `hasValidCreator()`, `hasValidUpdater()`, および `hasValidTimestamps()` (サーバー時間との一致検証等) を組み合わせ、フロントエンド外から直接APIを叩かれても、意図しないフィールド（例：管理権限の偽装など）の改竄を防止しています。
