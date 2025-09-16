// UI要素取得
const popup = document.getElementById("call-popup");
const acceptBtn = document.getElementById("accept-btn");
const declineBtn = document.getElementById("decline-btn");

// 通話画面（動画再生用ページ）をランダム選択
const callPages = [
  "/call/scary1.html",
  "/call/scary2.html",
  "/call/scary3.html",
];

window.addEventListener("DOMContentLoaded", () => {
  // 3秒後にポップアップ表示＆音声再生
  setTimeout(() => {
    const popup = document.getElementById("call-popup");
    const sound = document.getElementById("tellSound");

    if (popup && sound) {
      // CSSクラスを使ってポップアップを表示
      popup.classList.add("show");

      // 少し遅延を入れて音声再生（レイアウト安定後）
      setTimeout(() => {
        sound.play().catch((error) => {
          console.log("音声の再生に失敗しました:", error);
        });
      }, 100);
    }
  });
});

// 「通話開始」ボタン → ランダムな通話画面へ遷移
acceptBtn.onclick = () => {
  const randomPage = callPages[Math.floor(Math.random() * callPages.length)];
  window.location.href = randomPage;
};

// 「拒否」ボタン → ポップアップ閉じる
declineBtn.onclick = () => {
  // 音声停止
  const sound = document.getElementById("tellSound");
  if (sound) {
    sound.pause();
    sound.currentTime = 0;
  }
  // CSSクラスを削除してポップアップを非表示
  popup.classList.remove("show");
};
