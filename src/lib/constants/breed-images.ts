import { SPECIES_DATA } from "@/lib/constants/species";
/**
 * 品種別サンプル画像URL
 *
 * Unsplash の画像URLを品種ごとに設定します。
 * 画像URLは images.unsplash.com から始まる形式で、
 * クエリパラメータで画像サイズを指定できます。
 *
 * 例: https://images.unsplash.com/photo-xxx?w=400&h=400&fit=crop
 *
 * 画像の探し方:
 * 1. https://unsplash.com で品種名（英語）を検索
 * 2. 良い画像をクリック
 * 3. 画像を右クリック → 「画像アドレスをコピー」
 * 4. URLの末尾に ?w=400&h=400&fit=crop を追加（またはパラメータを変更）
 */

export interface BreedImage {
  url: string;
  credit?: string; // 撮影者名（任意）
}

/**
 * 品種別画像マッピング
 * キー: 品種名（species.ts の breeds と一致させる）
 * 値: 画像URLの配列（複数のカラーバリエーションを含められる）
 */
export const BREED_IMAGES: Record<string, BreedImage[]> = {
  // =============================================
  // 犬
  // =============================================
  柴犬: [
    // TODO: Unsplash で「shiba inu」を検索して画像URLを追加
    // { url: "https://images.unsplash.com/photo-xxx?w=400&h=400&fit=crop" },
  ],
  豆柴: [
    {
      url: "http://127.0.0.1:9199/v0/b/aina-life.firebasestorage.app/o/pets%2FxizmhRJDg1fui2vsKLKI%2Favatar%2F1767768078773.webp?alt=media&token=da950ba6-e61b-4677-87dc-5545a11d204e",
    },
  ],
  秋田犬: [],
  甲斐犬: [],
  紀州犬: [],
  北海道犬: [],
  四国犬: [],
  狆: [],
  "ゴールデン・レトリーバー": [],
  "ラブラドール・レトリーバー": [],
  "フラットコーテッド・レトリーバー": [],
  "トイ・プードル": [],
  "ミニチュア・プードル": [],
  "スタンダード・プードル": [],
  チワワ: [],
  ポメラニアン: [],
  "フレンチ・ブルドッグ": [],
  "イングリッシュ・ブルドッグ": [],
  パグ: [],
  "ダックスフンド（ミニチュア）": [],
  "ダックスフンド（カニンヘン）": [],
  "ダックスフンド（スタンダード）": [],
  シーズー: [],
  "ヨークシャー・テリア": [],
  マルチーズ: [],
  "キャバリア・キング・チャールズ・スパニエル": [],
  パピヨン: [],
  ペキニーズ: [],
  "ボーダー・コリー": [],
  "シェットランド・シープドッグ": [],
  "コーギー（ペンブローク）": [],
  "コーギー（カーディガン）": [],
  "ジャーマン・シェパード・ドッグ": [],
  ドーベルマン: [],
  ロットワイラー: [],
  "シベリアン・ハスキー": [],
  "アラスカン・マラミュート": [],
  ボクサー: [],
  "ミニチュア・シュナウザー": [],
  "ジャック・ラッセル・テリア": [],
  "ウエスト・ハイランド・ホワイト・テリア": [],
  "ビション・フリーゼ": [],
  "アメリカン・コッカー・スパニエル": [],
  "イングリッシュ・コッカー・スパニエル": [],
  ビーグル: [],
  ダルメシアン: [],
  "グレート・ピレニーズ": [],
  "バーニーズ・マウンテン・ドッグ": [],
  "セント・バーナード": [],
  ボルゾイ: [],
  "イタリアン・グレーハウンド": [],
  ウィペット: [],
  サモエド: [],

  // =============================================
  // 猫
  // =============================================
  "日本猫（和猫）": [],
  "スコティッシュ・フォールド": [],
  マンチカン: [],
  "アメリカン・ショートヘア": [],
  "ブリティッシュ・ショートヘア": [],
  "エキゾチック・ショートヘア": [],
  ペルシャ: [],
  ヒマラヤン: [],
  メインクーン: [],
  "ノルウェージャン・フォレスト・キャット": [],
  サイベリアン: [],
  ラグドール: [],
  ラガマフィン: [],
  ベンガル: [],
  アビシニアン: [],
  ソマリ: [],
  ロシアンブルー: [],
  シャルトリュー: [],
  コラット: [],
  シャム: [],
  "オリエンタル・ショートヘア": [],
  バーマン: [],
  トンキニーズ: [],
  シンガプーラ: [],
  スフィンクス: [],
  デボンレックス: [],
  コーニッシュレックス: [],
  セルカークレックス: [],
  ターキッシュアンゴラ: [],
  ターキッシュバン: [],
  アメリカンカール: [],
  アメリカンボブテイル: [],
  ジャパニーズボブテイル: [],
  エジプシャンマウ: [],
  オシキャット: [],
  ラパーマ: [],
  ネーベロング: [],
  "ブリティッシュ・ロングヘア": [],

  // =============================================
  // ウサギ
  // =============================================
  "ネザーランド・ドワーフ": [],
  "ホーランド・ロップ": [],
  ミニレッキス: [],
  アンゴラ: [],
  ライオンヘッド: [],

  // =============================================
  // ハムスター
  // =============================================
  ゴールデンハムスター: [],
  ジャンガリアンハムスター: [],
  ロボロフスキーハムスター: [],
  キャンベルハムスター: [],

  // =============================================
  // その他小動物
  // =============================================
  "モルモット（イングリッシュ）": [],
  "モルモット（アビシニアン）": [],
  フェレット: [],
  チンチラ: [],
  デグー: [],

  // =============================================
  // 鳥類
  // =============================================
  セキセイインコ: [],
  オカメインコ: [],
  マメルリハ: [],
  コザクラインコ: [],
  ボタンインコ: [],
  ヨウム: [],
  "文鳥（白）": [],
  "文鳥（桜）": [],
  カナリア: [],

  // =============================================
  // 爬虫類
  // =============================================
  ヒョウモントカゲモドキ: [],
  クレステッドゲッコー: [],
  フトアゴヒゲトカゲ: [],
  コーンスネーク: [],
  ボールパイソン: [],
  ミドリガメ: [],
  クサガメ: [],
  ヘルマンリクガメ: [],
  ギリシャリクガメ: [],

  // =============================================
  // 両生類
  // =============================================
  ウーパールーパー: [],
  クランウェルツノガエル: [],
  アフリカツメガエル: [],

  // =============================================
  // 魚類
  // =============================================
  "金魚（和金）": [],
  "金魚（琉金）": [],
  "金魚（ランチュウ）": [],
  "メダカ（幹之）": [],
  グッピー: [],
  ネオンテトラ: [],
  ベタ: [],
  エンゼルフィッシュ: [],
  カクレクマノミ: [],
  ギンガハゼ: [],

  // =============================================
  // 無脊椎動物
  // =============================================
  カブトムシ: [],
  オオクワガタ: [],
  タランチュラ: [],
  アメリカザリガニ: [],
  ミナミヌマエビ: [],
};

/**
 * 品種に対応するサンプル画像を取得
 * @param breed 品種名
 * @returns 画像URLの配列（空の場合は空配列）
 */
export function getBreedImages(breed: string): BreedImage[] {
  return BREED_IMAGES[breed] || [];
}

/**
 * 品種にサンプル画像が存在するかチェック
 * @param breed 品種名
 * @returns 画像が存在する場合 true
 */
export function hasBreedImages(breed: string): boolean {
  const images = BREED_IMAGES[breed];
  return images !== undefined && images.length > 0;
}

/**
 * 品種からspeciesを逆引きするヘルパー
 */
export function findSpeciesForBreed(
  breed: string,
): { species: string; label: string } | null {
  // 犬
  const dogs = SPECIES_DATA.mammals.categories.dogs;
  if ((dogs.breeds as readonly string[]).includes(breed)) {
    return { species: dogs.species, label: dogs.label };
  }

  // 猫
  const cats = SPECIES_DATA.mammals.categories.cats;
  if ((cats.breeds as readonly string[]).includes(breed)) {
    return { species: cats.species, label: cats.label };
  }

  // 小動物
  const smallMammals = SPECIES_DATA.mammals.categories.small_mammals.categories;
  for (const category of Object.values(smallMammals)) {
    if ((category.breeds as readonly string[]).includes(breed)) {
      return { species: breed, label: category.label };
    }
  }

  // 鳥類
  const birds = SPECIES_DATA.birds.categories.parrots_and_finches;
  if ((birds.breeds as readonly string[]).includes(breed)) {
    return { species: breed, label: birds.label };
  }

  // 爬虫類
  for (const category of Object.values(SPECIES_DATA.reptiles.categories)) {
    if ((category.breeds as readonly string[]).includes(breed)) {
      return { species: breed, label: category.label };
    }
  }

  // 両生類
  const amphibians = SPECIES_DATA.amphibians.categories.frogs_and_salamanders;
  if ((amphibians.breeds as readonly string[]).includes(breed)) {
    return { species: breed, label: amphibians.label };
  }

  // 魚類
  for (const category of Object.values(SPECIES_DATA.fish.categories)) {
    if ((category.breeds as readonly string[]).includes(breed)) {
      return { species: breed, label: category.label };
    }
  }

  // 無脊椎動物
  const invertebrates =
    SPECIES_DATA.invertebrates.categories.insects_and_others;
  if ((invertebrates.breeds as readonly string[]).includes(breed)) {
    return { species: breed, label: invertebrates.label };
  }

  return null;
}

/**
 * 画像が登録されている品種のみを取得
 */
export function getAvailableBreeds(): {
  breed: string;
  species: string;
  speciesLabel: string;
  images: BreedImage[];
}[] {
  const result: {
    breed: string;
    species: string;
    speciesLabel: string;
    images: BreedImage[];
  }[] = [];

  for (const [breed, images] of Object.entries(BREED_IMAGES)) {
    if (images && images.length > 0) {
      const speciesInfo = findSpeciesForBreed(breed);
      if (speciesInfo) {
        result.push({
          breed,
          species: speciesInfo.species,
          speciesLabel: speciesInfo.label,
          images,
        });
      }
    }
  }

  return result;
}
