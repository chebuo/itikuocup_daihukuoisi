// Firebase設定（ここに実際の設定を入れてください）
const firebaseConfig = {
  // ここに Firebase Console から取得した設定を貼り付けてください
  apiKey: "AIzaSyAo6Teruh-6dPXACBAeJbH_lCmXzfTKt8M",
  authDomain: "itikuo-37042.firebaseapp.com",
  projectId: "itikuo-37042",
  storageBucket: "itikuo-37042.firebasestorage.app",
  messagingSenderId: "258262199926",
  appId: "1:258262199926:web:03304ca76fb8cc4585f957",
};

// Firebase初期化
let auth, db;
try {
  // Firebase設定が完了している場合のみ初期化
  if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("Firebase初期化完了");
  } else {
    console.warn("Firebase設定が未完了です。開発モードで動作します。");
    // 開発用のモックオブジェクト
    auth = {
      currentUser: {
        uid: "test-user",
        displayName: "田中太郎",
        photoURL: null,
      },
      onAuthStateChanged: (callback) => {
        // 開発用: 1秒後にモックユーザーでコールバック実行
        setTimeout(() => callback(auth.currentUser), 1000);
      },
    };
    db = {};
  }
} catch (error) {
  console.error("Firebase初期化エラー:", error);
  // エラー時もモックオブジェクトを使用
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => callback(null),
  };
  db = {};
}

// ProfileManager クラス
class ProfileManager {
  constructor() {
    this.isEditing = false;
    this.currentUsername = "田中太郎";
    this.tempUsername = this.currentUsername;
    this.currentProfileImageBase64 = null;
    this.isLoading = false;
    this.maxImageSize = 500 * 1024; // 500KB制限（Firestoreの1MB制限内に収める）

    this.initElements();
    this.bindEvents();
    this.updateUI();

    // Firebase認証状態の監視
    this.setupAuthStateListener();
  }

  // Firebase認証状態リスナーの設定
  setupAuthStateListener() {
    if (auth && auth.onAuthStateChanged) {
      auth.onAuthStateChanged((user) => {
        this.onAuthStateChanged(user);
      });
    }
  }

  // DOM要素の初期化
  initElements() {
    this.elements = {
      avatarImage: document.getElementById("avatarImage"),
      avatarPlaceholder: document.getElementById("avatarPlaceholder"),
      avatarUploadBtn: document.getElementById("avatarUploadBtn"),
      avatarHelpText: document.getElementById("avatarHelpText"),
      fileInput: document.getElementById("fileInput"),
      usernameDisplay: document.getElementById("usernameDisplay"),
      usernameValue: document.getElementById("usernameValue"),
      usernameInput: document.getElementById("usernameInput"),
      editBtn: document.getElementById("editBtn"),
      buttonGroup: document.getElementById("buttonGroup"),
      cancelBtn: document.getElementById("cancelBtn"),
      saveBtn: document.getElementById("saveBtn"),
      saveText: document.getElementById("saveText"),
      loadingSpinner: document.getElementById("loadingSpinner"),
      successMessage: document.getElementById("successMessage"),
      errorMessage: document.getElementById("errorMessage"),
    };

    // 要素が見つからない場合のエラーチェック
    for (const [key, element] of Object.entries(this.elements)) {
      if (!element) {
        console.error(`要素が見つかりません: ${key}`);
      }
    }
  }

  // イベントリスナーの設定
  bindEvents() {
    if (this.elements.editBtn) {
      this.elements.editBtn.addEventListener("click", () =>
        this.startEditing()
      );
    }

    if (this.elements.avatarUploadBtn) {
      this.elements.avatarUploadBtn.addEventListener("click", () =>
        this.elements.fileInput.click()
      );
    }

    if (this.elements.fileInput) {
      this.elements.fileInput.addEventListener("change", (e) =>
        this.handleImageChange(e)
      );
    }

    if (this.elements.cancelBtn) {
      this.elements.cancelBtn.addEventListener("click", () =>
        this.cancelEditing()
      );
    }

    if (this.elements.saveBtn) {
      this.elements.saveBtn.addEventListener("click", () => this.saveProfile());
    }

    if (this.elements.usernameInput) {
      this.elements.usernameInput.addEventListener("input", (e) =>
        this.handleUsernameChange(e)
      );
    }
  }

  // UI初期化
  updateUI() {
    if (this.elements.usernameValue) {
      this.elements.usernameValue.textContent = this.currentUsername;
    }
  }

  // ユーザープロフィール読み込み
  async loadUserProfile() {
    try {
      if (!auth.currentUser || !db.collection) {
        console.log("Firebase未設定またはユーザー未ログイン");
        return;
      }

      const userDoc = await db
        .collection("users")
        .doc(auth.currentUser.uid)
        .get();
      if (userDoc.exists) {
        const userData = userDoc.data();

        // ユーザー名を更新
        if (userData.displayName) {
          this.currentUsername = userData.displayName;
          this.elements.usernameValue.textContent = this.currentUsername;
        }

        // プロフィール画像を更新
        if (userData.profileImageBase64) {
          this.elements.avatarImage.src = userData.profileImageBase64;
          this.elements.avatarImage.style.display = "block";
          this.elements.avatarPlaceholder.style.display = "none";
        }
      }
    } catch (error) {
      console.error("プロフィール読み込みエラー:", error);
    }
  }

  // 編集モード開始
  startEditing() {
    console.log("編集モード開始");
    this.isEditing = true;
    this.tempUsername = this.currentUsername;

    // 編集ボタンを非表示
    if (this.elements.editBtn) {
      this.elements.editBtn.style.display = "none";
    }

    // ユーザー名表示を非表示
    if (this.elements.usernameDisplay) {
      this.elements.usernameDisplay.style.display = "none";
    }

    // ユーザー名入力を表示
    if (this.elements.usernameInput) {
      this.elements.usernameInput.classList.add("show");
      this.elements.usernameInput.value = this.tempUsername;
      this.elements.usernameInput.focus();
    }

    // ボタングループを表示
    if (this.elements.buttonGroup) {
      this.elements.buttonGroup.classList.add("show");
    }

    // アバター関連要素を表示
    if (this.elements.avatarUploadBtn) {
      this.elements.avatarUploadBtn.classList.add("show");
    }

    if (this.elements.avatarHelpText) {
      this.elements.avatarHelpText.classList.add("show");
    }

    this.hideMessages();
    this.updateSaveButtonState();
  }

  // 編集キャンセル
  cancelEditing() {
    console.log("編集キャンセル");
    this.isEditing = false;
    this.tempUsername = this.currentUsername;
    this.currentProfileImageBase64 = null;

    // 編集ボタンを表示
    if (this.elements.editBtn) {
      this.elements.editBtn.style.display = "";
    }

    // ユーザー名表示を表示
    if (this.elements.usernameDisplay) {
      this.elements.usernameDisplay.style.display = "flex";
    }

    // ユーザー名入力を非表示
    if (this.elements.usernameInput) {
      this.elements.usernameInput.classList.remove("show");
    }

    // ボタングループを非表示
    if (this.elements.buttonGroup) {
      this.elements.buttonGroup.classList.remove("show");
    }

    // アバター関連要素を非表示
    if (this.elements.avatarUploadBtn) {
      this.elements.avatarUploadBtn.classList.remove("show");
    }

    if (this.elements.avatarHelpText) {
      this.elements.avatarHelpText.classList.remove("show");
    }

    this.hideMessages();

    // ファイル入力をリセット
    if (this.elements.fileInput) {
      this.elements.fileInput.value = "";
    }
  }

  // ユーザー名変更処理
  handleUsernameChange(e) {
    this.tempUsername = e.target.value;
    this.updateSaveButtonState();
  }

  // 画像のリサイズとBase64変換
  resizeImageToBase64(file, maxWidth = 200, maxHeight = 200, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // アスペクト比を維持してリサイズ
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // 画像をcanvasに描画
        ctx.drawImage(img, 0, 0, width, height);

        // Base64に変換
        const base64 = canvas.toDataURL("image/jpeg", quality);

        // サイズチェック
        if (base64.length > this.maxImageSize) {
          // 品質を下げて再試行
          if (quality > 0.3) {
            this.resizeImageToBase64(file, maxWidth, maxHeight, quality - 0.1)
              .then(resolve)
              .catch(reject);
            return;
          } else {
            reject(new Error("画像サイズが大きすぎます"));
            return;
          }
        }

        resolve(base64);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // 画像変更処理
  async handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      this.showError("画像ファイルを選択してください");
      return;
    }

    try {
      // ローディング表示
      this.showSuccess("画像を処理中...");

      // 画像をリサイズしてBase64に変換
      const base64 = await this.resizeImageToBase64(file);
      this.currentProfileImageBase64 = base64;

      // プレビュー表示
      if (this.elements.avatarImage) {
        this.elements.avatarImage.src = base64;
        this.elements.avatarImage.style.display = "block";
      }
      if (this.elements.avatarPlaceholder) {
        this.elements.avatarPlaceholder.style.display = "none";
      }

      this.hideMessages();
      this.showSuccess("画像を選択しました！保存ボタンを押してください。");
    } catch (error) {
      console.error("画像処理エラー:", error);
      this.showError("画像の処理に失敗しました。別の画像を試してください。");
    }
  }

  // 保存ボタンの状態更新
  updateSaveButtonState() {
    const hasValidUsername = this.tempUsername.trim().length > 0;
    if (this.elements.saveBtn) {
      this.elements.saveBtn.disabled = !hasValidUsername || this.isLoading;
    }
  }

  // プロフィール保存
  async saveProfile() {
    if (this.isLoading) return;

    console.log("プロフィール保存開始");
    this.isLoading = true;
    this.updateSaveButtonState();

    if (this.elements.saveText) {
      this.elements.saveText.style.display = "none";
    }
    if (this.elements.loadingSpinner) {
      this.elements.loadingSpinner.style.display = "block";
    }

    try {
      if (auth.currentUser && db.collection) {
        // Firestoreにユーザープロフィールを保存
        const userProfile = {
          displayName: this.tempUsername,
          profileImageBase64: this.currentProfileImageBase64 || null,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        await db
          .collection("users")
          .doc(auth.currentUser.uid)
          .set(userProfile, { merge: true });

        // Authのプロフィールも更新（displayNameのみ）
        await auth.currentUser.updateProfile({
          displayName: this.tempUsername,
        });
      } else {
        // 開発モード用の疑似処理
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // 成功時の処理
      this.currentUsername = this.tempUsername;
      if (this.elements.usernameValue) {
        this.elements.usernameValue.textContent = this.currentUsername;
      }
      this.cancelEditing();
      this.showSuccess("プロフィールを更新しました！");
    } catch (error) {
      console.error("プロフィール更新エラー:", error);
      this.showError("更新に失敗しました。もう一度お試しください。");
    } finally {
      this.isLoading = false;
      if (this.elements.saveText) {
        this.elements.saveText.style.display = "block";
      }
      if (this.elements.loadingSpinner) {
        this.elements.loadingSpinner.style.display = "none";
      }
      this.updateSaveButtonState();
    }
  }

  // 成功メッセージ表示
  showSuccess(message) {
    this.hideMessages();
    if (this.elements.successMessage) {
      this.elements.successMessage.textContent = message;
      this.elements.successMessage.style.display = "block";
      setTimeout(() => this.hideMessages(), 3000);
    }
  }

  // エラーメッセージ表示
  showError(message) {
    this.hideMessages();
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message;
      this.elements.errorMessage.style.display = "block";
    }
  }

  // メッセージ非表示
  hideMessages() {
    if (this.elements.successMessage) {
      this.elements.successMessage.style.display = "none";
    }
    if (this.elements.errorMessage) {
      this.elements.errorMessage.style.display = "none";
    }
  }

  // Firebase認証状態変更時の処理
  onAuthStateChanged(user) {
    console.log("認証状態変更:", user ? "ログイン" : "ログアウト");

    if (user) {
      // ログイン時はFirestoreからプロフィールを読み込み
      this.loadUserProfile();
    } else {
      // ログアウト時はデフォルト状態に戻す
      this.currentUsername = "ゲストユーザー";
      if (this.elements.usernameValue) {
        this.elements.usernameValue.textContent = this.currentUsername;
      }
      if (this.elements.avatarImage) {
        this.elements.avatarImage.style.display = "none";
      }
      if (this.elements.avatarPlaceholder) {
        this.elements.avatarPlaceholder.style.display = "flex";
      }
    }
  }
}

// アプリ初期化
document.addEventListener("DOMContentLoaded", () => {
  try {
    window.profileManager = new ProfileManager();
    console.log("プロフィール画面が初期化されました");
  } catch (error) {
    console.error("初期化エラー:", error);
  }
});
