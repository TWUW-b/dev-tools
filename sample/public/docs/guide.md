# 使い方ガイド

![検証用グラデーション画像](http://localhost:8081/manual/media/2c4648a54b84cd131e1797090116495a5faeea6961b6c33b?env=dev)

マニュアル画像アップロードAPI(RFC 002)で実際にアップロードした画像です。API(localhost:8081)と
sample app(localhost:3000)はオリジンが異なるため、Markdown内では絶対URLで参照する必要があります。

## デバッグモードの起動

デバッグモードを有効にする方法は3つあります:

1. URL に `#debug` を付ける
2. `z` キーを素早く3回押す
3. URL に `#debug` を付ける

## デバッグパネル

デバッグモードが有効な場合、画面右下にバグアイコンが表示されます。

クリックすると以下の機能が使えます:

### Record タブ

不具合や違和感を記録します。

| 項目 | 説明 |
|------|------|
| タイトル | 問題の要約 |
| 内容 | 詳細な説明 |
| 重要度 | critical / high / medium / low |

### Manage タブ

記録されたノートの一覧を確認・管理します。

### Test タブ

テストケースのチェックリストを実行します。

## マニュアル表示

PiP（Picture-in-Picture）ウィンドウで Markdown ドキュメントを表示できます。

## フィードバック

ユーザーからのバグ報告・要望・質問を収集できます。

## 手順

<div class="manual-step">
  <div class="manual-step-info">
    <div class="manual-step-num"><span class="n">1</span><span class="manual-step-cap">デバッグモードを有効にする</span></div>
    <p class="manual-step-detail">URL に <code>#debug</code> を付けるか、<code>z</code> キーを素早く3回押します。</p>
  </div>
  <div class="manual-shot">
    <img src="/docs/images/sample-form.png" alt="サンプル画面(ダミー)。保存ボタンの位置">
    <div class="manual-mark" style="left:5.5%;top:76%;width:31%;height:12%"></div>
  </div>
</div>

<div class="manual-step">
  <div class="manual-step-info">
    <div class="manual-step-num"><span class="n">2</span><span class="manual-step-cap">画面右下のバグアイコンをクリックする</span></div>
    <p class="manual-step-detail">Record / Manage / Test の3タブが開きます。</p>
  </div>
</div>

<div class="manual-step">
  <div class="manual-step-info">
    <div class="manual-step-num"><span class="n">3</span><span class="manual-step-cap">Record タブから記録する</span></div>
  </div>
</div>

---

[FAQ はこちら](/docs/faq.md) | [API リファレンス](/docs/api.md)
