import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "利用規約 - aina-life",
  description: "aina-life の利用規約",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            戻る
          </Button>
        </Link>

        <h1 className="text-2xl font-bold mb-6">利用規約</h1>
        <p className="text-sm text-muted-foreground mb-8">
          最終更新日: 2026年3月18日
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">第1条（適用）</h2>
            <p className="text-muted-foreground leading-relaxed">
              本利用規約（以下「本規約」）は、aina-life（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本サービスを利用することにより、本規約に同意したものとみなされます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              第2条（サービスの内容）
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              本サービスは、ペットの日常を記録・共有するための日記アプリケーションです。以下の機能を提供します。
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
              <li>ペット情報の登録・管理</li>
              <li>日記・予定の記録</li>
              <li>体重記録・グラフ表示</li>
              <li>カレンダー表示</li>
              <li>ペット情報の共有（メンバー招待）</li>
              <li>お散歩友達の管理</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">第3条（アカウント）</h2>
            <p className="text-muted-foreground leading-relaxed">
              本サービスの利用にはGoogleアカウントによる認証が必要です。ユーザーは自己の責任においてアカウントを管理するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">第4条（禁止事項）</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>他のユーザーの情報を不正に収集する行為</li>
              <li>不正アクセスまたはそのおそれのある行為</li>
              <li>本サービスの趣旨に反する利用</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              第5条（サービスの変更・停止）
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              運営者は、事前の通知なく本サービスの内容を変更、または提供を停止することができるものとします。これによりユーザーに損害が生じた場合でも、運営者は一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">第6条（免責事項）</h2>
            <p className="text-muted-foreground leading-relaxed">
              運営者は、本サービスの利用により生じたいかなる損害についても、一切の責任を負わないものとします。ユーザーが本サービスに保存したデータの消失・破損について、運営者は責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">第7条（知的財産権）</h2>
            <p className="text-muted-foreground leading-relaxed">
              本サービスに関する知的財産権は運営者に帰属します。ユーザーが投稿したコンテンツ（写真・テキスト等）の著作権はユーザーに帰属しますが、本サービスの提供に必要な範囲で運営者が利用することができるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">第8条（規約の変更）</h2>
            <p className="text-muted-foreground leading-relaxed">
              運営者は、必要に応じて本規約を変更できるものとします。変更後の規約は、本サービス上に掲載した時点で効力を生じるものとします。
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
