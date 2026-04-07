# RFC (Request for Comments)

大きな設計変更・破壊的変更・複数案の比較検討が必要な機能は、ここに RFC として起票する。

## ステータス

| Status | 意味 |
|---|---|
| `Draft` | 書きかけ。他者レビュー不要 |
| **`Proposed`** | 提案中。仕様未確定。議論・合意待ち |
| `Accepted` | 合意済み。実装待ち or 実装中 |
| `Implemented` | 実装完了。該当バージョンに取り込み済み |
| `Rejected` | 却下。理由を本文に残す |
| `Superseded by #NNN` | 別 RFC に置き換え |

## 運用

- ファイル名: `NNN-kebab-case-title.md`（3 桁ゼロ埋め連番）
- 先頭に frontmatter 風のメタ情報（status / created / updated / target-version）を記載
- 本文に「背景 / 要件 / 案 / トレードオフ / オープン課題 / 決定」を含める
- Accepted 以降は変更履歴を末尾に追記

## 一覧

| # | Title | Status | Target |
|---|---|---|---|
| [001](./001-environment-switching.md) | 環境切替機能（dev/test/staging/prod） | **Proposed** | 未定 |
