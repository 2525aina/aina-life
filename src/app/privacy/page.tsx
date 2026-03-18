import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "プライバシーポリシー - aina-life",
  description: "aina-life のプライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            戻る
          </Button>
        </Link>

        <h1 className="text-2xl font-bold mb-6">プライバシーポリシー</h1>
        <p className="text-sm text-muted-foreground mb-8">
          最終更新日: 2026年3月18日
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. 収集する情報</h2>
            <p className="text-muted-foreground leading-relaxed">
              本サービスでは、以下の情報を収集します。
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
              <li>
                <strong>Googleアカウント情報</strong>：
                メールアドレス、表示名（Google認証を通じて取得）
              </li>
              <li>
                <strong>プロフィール情報</strong>：
                ニックネーム、自己紹介、誕生日、性別（任意入力）
              </li>
              <li>
                <strong>ペット情報</strong>：
                ペットの名前、種類、品種、写真など（ユーザーが入力した内容）
              </li>
              <li>
                <strong>利用データ</strong>：
                日記エントリー、体重記録、お散歩友達情報など
              </li>
              <li>
                <strong>画像データ</strong>： ユーザーがアップロードした写真
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. 情報の利用目的</h2>
            <p className="text-muted-foreground leading-relaxed">
              収集した情報は、以下の目的で利用します。
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
              <li>本サービスの提供・運営</li>
              <li>ユーザー認証</li>
              <li>ペット情報の共有機能（メンバー招待）</li>
              <li>サービスの改善・新機能の開発</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              3. 利用する外部サービス
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              本サービスでは、以下の外部サービスを利用しています。
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
              <li>
                <strong>Firebase Authentication</strong>： ユーザー認証（Google
                ログイン）
              </li>
              <li>
                <strong>Cloud Firestore</strong>： データの保存・管理
              </li>
              <li>
                <strong>Firebase Storage</strong>： 画像ファイルの保存
              </li>
              <li>
                <strong>Firebase Hosting</strong>：
                アプリケーションのホスティング
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-2">
              これらのサービスにおけるデータの取り扱いについては、
              <a
                href="https://firebase.google.com/support/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Firebase プライバシーポリシー
              </a>
              および
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google プライバシーポリシー
              </a>
              をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. 情報の共有</h2>
            <p className="text-muted-foreground leading-relaxed">
              ユーザーの個人情報を第三者に販売・提供することはありません。ただし、以下の場合を除きます。
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく要請がある場合</li>
              <li>
                ペット共有機能において、ユーザーが招待したメンバーに対してペット情報を共有する場合
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. データの保管</h2>
            <p className="text-muted-foreground leading-relaxed">
              ユーザーのデータは Firebase（Google Cloud
              Platform）上に保管されます。データの保護には暗号化通信（SSL/TLS）および
              Firebase のセキュリティルールを使用しています。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. ユーザーの権利</h2>
            <p className="text-muted-foreground leading-relaxed">
              ユーザーは以下の権利を有します。
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
              <li>自身のプロフィール情報の閲覧・編集</li>
              <li>自身が登録したデータの閲覧・編集・削除</li>
              <li>ペット共有からの脱退</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Cookie の使用</h2>
            <p className="text-muted-foreground leading-relaxed">
              本サービスでは、認証セッションの維持のためにブラウザの Cookie
              およびローカルストレージを使用します。これらは本サービスの正常な動作に必要なものです。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. ポリシーの変更</h2>
            <p className="text-muted-foreground leading-relaxed">
              本プライバシーポリシーは、必要に応じて変更されることがあります。重要な変更がある場合は、本サービス上でお知らせします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. お問い合わせ</h2>
            <p className="text-muted-foreground leading-relaxed">
              プライバシーに関するご質問やご懸念がございましたら、本サービスの運営者までお問い合わせください。
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
