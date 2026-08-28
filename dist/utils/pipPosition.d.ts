/**
 * ManualPiP の初期表示位置の計算ロジック。
 *
 * Document Picture-in-Picture API の `requestWindow()` は width/height のみを
 * 受け付け、位置(x/y)は指定できない仕様のため、ブラウザ既定では常に画面左上に
 * 開く。ManualPiP はこの関数の戻り値で `pip.moveTo(x, y)` を呼び、既定では
 * 画面右下に配置する。
 *
 * 純粋関数として切り出しているのは、Document Picture-in-Picture API 自体が
 * CDP 経由の自動化ブラウザでは `InvalidStateError` で開けず実機検証ができない
 * ため（既知の制約）、位置計算だけは決定論的な単体テストで検証できるようにする
 * ため。
 */
export interface PipPositionInput {
    /** PiP ウィンドウの幅（リクエストした値） */
    pipWidth: number;
    /** PiP ウィンドウの高さ（リクエストした値） */
    pipHeight: number;
    /** 配置先ディスプレイの利用可能幅（`window.screen.availWidth` 相当） */
    screenAvailWidth: number;
    /** 配置先ディスプレイの利用可能高さ（`window.screen.availHeight` 相当） */
    screenAvailHeight: number;
    /** 明示指定された初期位置。指定時はこちらを優先する */
    initialPosition?: {
        x: number;
        y: number;
    };
    /** 画面端からの余白(px)。デフォルト 20px */
    margin?: number;
}
/**
 * PiP ウィンドウの初期表示位置(左上座標)を計算する。
 *
 * - `initialPosition` が指定されていればそれをそのまま返す。
 * - 未指定時は画面右下に `margin` 分の余白を空けて配置する座標を返す。
 * - ウィンドウサイズが画面サイズより大きい等で座標が負になる場合は 0 にクランプする。
 */
export declare function computePipPosition({ pipWidth, pipHeight, screenAvailWidth, screenAvailHeight, initialPosition, margin, }: PipPositionInput): {
    x: number;
    y: number;
};
