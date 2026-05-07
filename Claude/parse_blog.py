"""
はてなブログエクスポートをパースして persona.md を生成するスクリプト
"""
import re
from collections import Counter
from bs4 import BeautifulSoup

EXPORT_FILE = "過去発言/nao-u.hatenablog.com.export.txt"
OUTPUT_PERSONA = "persona.md"

def parse_entries(text):
    """MTエクスポート形式をエントリごとに分割"""
    entries = []
    blocks = text.split("--------")
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        entry = {}
        # DATE
        m = re.search(r"DATE: (.+)", block)
        entry["date"] = m.group(1).strip() if m else ""
        # BODY
        m = re.search(r"BODY:\n(.*?)(?:\n-----)", block, re.DOTALL)
        entry["body_html"] = m.group(1).strip() if m else ""
        entries.append(entry)
    return entries

def extract_original_comments(html):
    """他人のツイート埋め込みを除いたNao_u本人のテキストを抽出"""
    soup = BeautifulSoup(html, "html.parser")
    # blockquoteを全削除（他人のツイート）
    for bq in soup.find_all("blockquote"):
        bq.decompose()
    # iframeも削除（YouTube等）
    for iframe in soup.find_all("iframe"):
        iframe.decompose()
    # scriptも削除
    for script in soup.find_all("script"):
        script.decompose()
    text = soup.get_text(separator=" ").strip()
    # 空白行を除去
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    return " ".join(lines)

def extract_embedded_titles(html):
    """埋め込みリンクのタイトルを抽出（興味トピックの手がかり）"""
    soup = BeautifulSoup(html, "html.parser")
    titles = []
    # hatenablog embed の title属性
    for iframe in soup.find_all("iframe"):
        t = iframe.get("title", "")
        if t:
            titles.append(t)
    return titles

def extract_tweet_texts(html):
    """埋め込みツイートのテキストを抽出"""
    soup = BeautifulSoup(html, "html.parser")
    texts = []
    for bq in soup.find_all("blockquote", class_="twitter-tweet"):
        p = bq.find("p")
        if p:
            texts.append(p.get_text())
    return texts

def extract_hashtags(text):
    return re.findall(r"#([\w\u3040-\u9fff]+)", text)

def main():
    with open(EXPORT_FILE, encoding="utf-8") as f:
        raw = f.read()

    entries = parse_entries(raw)
    print(f"エントリ数: {len(entries)}")

    all_original_comments = []
    all_tweet_texts = []
    all_embed_titles = []
    all_hashtags = []

    for e in entries:
        html = e["body_html"]
        if not html:
            continue

        comment = extract_original_comments(html)
        if comment:
            all_original_comments.append(comment)

        tweets = extract_tweet_texts(html)
        all_tweet_texts.extend(tweets)
        all_hashtags.extend(extract_hashtags(" ".join(tweets)))

        titles = extract_embedded_titles(html)
        all_embed_titles.extend(titles)

    # ハッシュタグ頻度集計
    hashtag_counter = Counter(all_hashtags)

    # 興味ワードをembedタイトルから抽出
    game_keywords = []
    for title in all_embed_titles:
        game_keywords.append(title)

    # persona.md 生成
    persona_lines = []
    persona_lines.append("# Nao_u ペルソナ定義\n")
    persona_lines.append("## このBotについて")
    persona_lines.append("Nao_uのはてなブログ過去発言から自動生成されたペルソナ定義。")
    persona_lines.append("インディーゲーム・レトロゲームに関する最新動向をNao_uの視点でツイートするBotに使用する。\n")

    persona_lines.append("## 興味・関心ジャンル（ブログ投稿傾向から）")
    top_tags = hashtag_counter.most_common(30)
    if top_tags:
        for tag, count in top_tags:
            persona_lines.append(f"- #{tag} ({count}回)")
    persona_lines.append("")

    persona_lines.append("## 注目していたコンテンツ（埋め込みリンクタイトル）")
    for title in all_embed_titles[:40]:
        if title.strip():
            persona_lines.append(f"- {title.strip()}")
    persona_lines.append("")

    persona_lines.append("## 本人のオリジナル発言サンプル（文体・トーン参考）")
    persona_lines.append("※ このブログは主にキュレーション形式のため、本人テキストは短め・メモ的")
    # 短くて意味のあるコメントだけ抽出（3〜50字）
    samples = [c for c in all_original_comments if 3 < len(c) <= 50][:30]
    for c in samples:
        persona_lines.append(f"- {c}")
    persona_lines.append("")

    persona_lines.append("## ツイート生成の指針")
    persona_lines.append("- 語調: 短め・メモ的・カジュアル。長文解説よりも「見つけた」「これ気になる」的なシェア感覚")
    persona_lines.append("- 絵文字: 最小限（使うとしても1〜2個）")
    persona_lines.append("- 専門性: 格闘ゲーム・インディー2Dアクション・ピクセルアート・レトロゲームに詳しい")
    persona_lines.append("- AIツール（ゲーム開発用途）にも関心あり")
    persona_lines.append("- 英語タイトルはそのまま使ってよい")
    persona_lines.append("- 140字以内")
    persona_lines.append("- ハッシュタグは1〜2個まで")

    with open(OUTPUT_PERSONA, "w", encoding="utf-8") as f:
        f.write("\n".join(persona_lines))

    print(f"\n[OK] {OUTPUT_PERSONA} を生成しました")
    print(f"  オリジナルコメント: {len(all_original_comments)}件")
    print(f"  埋め込みタイトル: {len(all_embed_titles)}件")
    print(f"  ハッシュタグ種類: {len(hashtag_counter)}種")
    print(f"\n頻出ハッシュタグ top10:")
    for tag, cnt in hashtag_counter.most_common(10):
        print(f"  #{tag}: {cnt}回")

if __name__ == "__main__":
    main()
