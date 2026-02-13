# ロジックバグ修正

**Status:** done

---

## 概要

コードレビューで発見されたロジックバグ・競合状態を修正。

---

## Bug 1: logCapture の多重インスタンス [DONE]

### 箇所
`src/utils/logCapture.ts`

### 問題
2つ目のインスタンスが `console.log` を再パッチすると、1つ目の `destroy()` がオリジナルではなくパッチ版に戻してしまい、キャプチャが永続化する。

### 修正内容
- `activeInstanceCount` カウンターを `activeInstance` 参照に変更
- 既存インスタンスがある場合は **自動で destroy** してから新規作成
- ドラフトの `throw` 案は StrictMode での二重マウントでクラッシュするため不採用

```ts
// Before: 警告だけ出して続行
if (activeInstanceCount > 0) {
  console.warn('...');
}
activeInstanceCount++;

// After: 前のインスタンスを安全に破棄
if (activeInstance) {
  activeInstance.destroy();
}
// ... create new instance ...
activeInstance = instance;
```

---

## Bug 2: useDebugNotes のフェッチ競合 [DONE]

### 箇所
`src/hooks/useDebugNotes.ts` + `src/utils/api.ts`

### 問題
`refreshTrigger` 連続変更時に前回の fetch がバックグラウンドで走り続ける。

### 修正内容
- `api.getNotes()` に `signal?: AbortSignal` パラメータを追加
- `useDebugNotes` の useEffect で `AbortController` を使用、クリーンアップで `abort()` を呼ぶ
- テスト3件を signal パラメータに対応するよう修正

---

## Bug 3: DebugPanel の PiP Portal クリーンアップ [DONE]

### 箇所
`src/components/DebugPanel.tsx`

### 問題
親コンポーネントが unmount されても PiP ウィンドウが閉じられない。

### 修正内容
- `pipWindowRef` で最新の pipWindow を追跡
- unmount 時の cleanup effect で `pipWindowRef.current?.close()` を確実に呼ぶ

```ts
const pipWindowRef = useRef(pipWindow);
pipWindowRef.current = pipWindow;
useEffect(() => {
  return () => { pipWindowRef.current?.close(); };
}, []);
```

---

## 変更ファイル

| ファイル | Bug | 変更内容 |
|---|---|---|
| `src/utils/logCapture.ts` | #1 | activeInstance シングルトン + 自動 destroy |
| `src/utils/api.ts` | #2 | getNotes に signal パラメータ追加 |
| `src/hooks/useDebugNotes.ts` | #2 | AbortController 導入 |
| `src/components/DebugPanel.tsx` | #3 | unmount 時 PiP close の useEffect 追加 |
| `src/utils/api.test.ts` | #2 | signal パラメータ対応 |
| `src/hooks/useDebugNotes.test.ts` | #2 | signal パラメータ対応 |
