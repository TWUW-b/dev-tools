# よくある質問

## Q: デバッグモードが有効にならない

`localStorage` にフラグが保存されます。ブラウザの開発者ツールで `localStorage` を確認してください。

```
localStorage.getItem('debugMode')
```

## Q: PiP ウィンドウが開かない

Document Picture-in-Picture API は Chrome 116+ でサポートされています。他のブラウザでは利用できません。

## Q: ログキャプチャが動作しない

`createLogCapture` はアプリ起動時に **1回だけ** 呼び出してください。複数回呼び出すとエラーになります。

```typescript
// OK: モジュールレベルで1回
const logCapture = createLogCapture({ console: true });

// NG: コンポーネント内で毎回
function App() {
  const logCapture = createLogCapture({ console: true }); // エラー
}
```

## Q: API に接続できない

1. Docker が起動しているか確認: `docker compose ps`
2. ポート 8081 が使用されていないか確認
3. `api/config.php` が存在するか確認
