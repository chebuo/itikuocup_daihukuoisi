// ProfileManager クラス
class ProfileManager {
  constructor() {
    this.isEditing = false;
    this.currentUsername = "田中太郎";
    this.tempUsername = this.currentUsername;
    this.currentProfileImage = null;
    this.isLoading = false;

    this.initElements();
    this.bindEvents();
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
  }

  // イベントリスナーの設定
  bindEvents() {
    this.elements.editBtn.addEventListener("click", () => this.startEditing());
    this.elements.avatarUploadBtn.addEventListener("click", () =>
      this.elements.fileInput.click()
    );
    this.elements.fileInput.addEventListener("change", (e) =>
      this.handleImageChange(e)
    );
    this.elements.cancelBtn.addEventListener("click", () =>
      this.cancelEditing()
    );
    this.elements.saveBtn.addEventListener("click", () => this.saveProfile());
    this.elements.usernameInput.addEventListener("input", (e) =>
      this.handleUsernameChange(e)
    );
  }

  // 編集モード開始
  startEditing() {
    this.isEditing = true;
    this.tempUsername = this.currentUsername;

    // UI更新
    this.elements.editBtn.style.display = "none";
    this.elements.usernameDisplay.style.display = "none";
    this.elements.usernameInput.classList.add("show");
    this.elements.usernameInput.value = this.tempUsername;
    this.elements.buttonGroup.classList.add("show");
    this.elements.avatarUploadBtn.classList.add("show");
    this.elements.avatarHelpText.classList.add("show");

    // フォーカス
    this.elements.usernameInput.focus();
    this.hideMessages();
  }

  // 編集キャンセル
  cancelEditing() {
    this.isEditing = false;
    this.tempUsername = this.currentUsername;

    // UI更新
    this.elements.editBtn.style.display = "";
    this.elements.usernameDisplay.style.display = "flex";
    this.elements.usernameInput.classList.remove("show");
    this.elements.buttonGroup.classList.remove("show");
    this.elements.avatarUploadBtn.classList.remove("show");
    this.elements.avatarHelpText.classList.remove("show");

    this.hideMessages();
  }

  // ユーザー名変更処理
  handleUsernameChange(e) {
    this.tempUsername = e.target.value;
    this.updateSaveButtonState();
  }

  // 画像変更処理
  handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // ファイルタイプチェック
    if (!file.type.startsWith("image/")) {
      this.showError("画像ファイルを選択してください");
      return;
    }

    // ファイルサイズチェック（5MB）
    if (file.size > 5 * 1024 * 1024) {
      this.showError("画像サイズは5MB以下にしてください");
      return;
    }

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentProfileImage = e.target.result;
      this.updateAvatarDisplay();
      this.hideMessages();
    };
    reader.readAsDataURL(file);
  }

  // アバター表示更新
  updateAvatarDisplay() {
    if (this.currentProfileImage) {
      this.elements.avatarImage.src = this.currentProfileImage;
      this.elements.avatarImage.style.display = "block";
      this.elements.avatarPlaceholder.style.display = "none";
    } else {
      this.elements.avatarImage.style.display = "none";
      this.elements.avatarPlaceholder.style.display = "flex";
    }
  }

  // 保存ボタンの状態更新
  updateSaveButtonState() {
    const hasValidUsername = this.tempUsername.trim().length > 0;
    this.elements.saveBtn.disabled = !hasValidUsername || this.isLoading;
  }

  // プロフィール保存
  async saveProfile() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.updateSaveButtonState();

    // Loading UI
    this.elements.saveText.style.display = "none";
    this.elements.loadingSpinner.style.display = "block";

    try {
      // Firebase処理をここに実装
      // 1. 画像がある場合はFirebase Storageにアップロード
      // 2. updateProfile()でプロフィール更新
      // 3. Firestoreにユーザー情報保存

      console.log("プロフィール更新中...", {
        username: this.tempUsername,
        hasImage: !!this.currentProfileImage,
      });

      // 実際のFirebase処理をここに書く
      await this.updateFirebaseProfile();

      // 成功時の処理
      this.currentUsername = this.tempUsername;
      this.elements.usernameValue.textContent = this.currentUsername;

      this.cancelEditing();
      this.elements.editBtn.style.display = "";
      this.showSuccess("プロフィールを更新しました！");
    } catch (error) {
      console.error("プロフィール更新エラー:", error);
      this.showError("更新に失敗しました。もう一度お試しください。");
    } finally {
      this.isLoading = false;
      this.elements.saveText.style.display = "block";
      this.elements.loadingSpinner.style.display = "none";
      this.updateSaveButtonState();
    }
  }

  // Firebase プロフィール更新処理（実装例）
  async updateFirebaseProfile() {
    // 疑似的な処理時間（実際は削除）
    await this.delay(2000);

    /* 実際のFirebase実装例:
        
        const user = auth.currentUser;
        if (!user) throw new Error('ログインしていません');
        
        let photoURL = user.photoURL;
        
        // 画像がある場合はアップロード
        if (this.currentProfileImage && this.elements.fileInput.files[0]) {
            const imageRef = ref(storage, `profiles/${user.uid}/avatar.jpg`);
            await uploadBytes(imageRef, this.elements.fileInput.files[0]);
            photoURL = await getDownloadURL(imageRef);
        }
        
        // Firebase Authのプロフィール更新
        await updateProfile(user, {
            displayName: this.tempUsername,
            photoURL: photoURL
        });
        
        // Firestoreにユーザー情報保存
        await setDoc(doc(db, 'users', user.uid), {
            displayName: this.tempUsername,
            photoURL: photoURL,
            updatedAt: new Date()
        }, { merge: true });
        
        */
  }

  // 成功メッセージ表示
  showSuccess(message) {
    this.hideMessages();
    this.elements.successMessage.textContent = message;
    this.elements.successMessage.style.display = "block";
    setTimeout(() => this.hideMessages(), 5000);
  }

  // エラーメッセージ表示
  showError(message) {
    this.hideMessages();
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.style.display = "block";
  }

  // メッセージ非表示
  hideMessages() {
    this.elements.successMessage.style.display = "none";
    this.elements.errorMessage.style.display = "none";
  }

  // 待機処理（デバッグ用）
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Firebase認証状態変更時の処理
  onAuthStateChanged(user) {
    if (user) {
      // ユーザー情報をUIに反映
      this.currentUsername = user.displayName || "ゲストユーザー";
      this.currentProfileImage = user.photoURL;
      this.elements.usernameValue.textContent = this.currentUsername;
      this.updateAvatarDisplay();
    } else {
      // ログアウト時の処理
      this.currentUsername = "ゲストユーザー";
      this.currentProfileImage = null;
      this.elements.usernameValue.textContent = this.currentUsername;
      this.updateAvatarDisplay();
    }
  }
}

// Firebase設定と初期化の処理
class FirebaseManager {
  constructor() {
    this.auth = null;
    this.storage = null;
    this.db = null;
    this.profileManager = null;
  }

  // Firebase初期化
  async initFirebase() {
    try {
      /* Firebase実装例:
            
            import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
            import { getAuth, updateProfile, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
            import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js';
            import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
            
            const firebaseConfig = {
                // あなたのFirebase設定
                apiKey: "your-api-key",
                authDomain: "your-project.firebaseapp.com",
                projectId: "your-project-id",
                storageBucket: "your-project.appspot.com",
                messagingSenderId: "123456789",
                appId: "your-app-id"
            };
            
            const app = initializeApp(firebaseConfig);
            this.auth = getAuth(app);
            this.storage = getStorage(app);
            this.db = getFirestore(app);
            
            // 認証状態の監視
            onAuthStateChanged(this.auth, (user) => {
                if (this.profileManager) {
                    this.profileManager.onAuthStateChanged(user);
                }
            });
            
            */

      console.log("Firebase初期化完了（デモモード）");
    } catch (error) {
      console.error("Firebase初期化エラー:", error);
    }
  }

  // ProfileManagerとの連携設定
  setProfileManager(profileManager) {
    this.profileManager = profileManager;
  }
}

// アプリ初期化
document.addEventListener("DOMContentLoaded", async () => {
  // ProfileManagerインスタンス作成
  window.profileManager = new ProfileManager();

  // FirebaseManagerインスタンス作成
  window.firebaseManager = new FirebaseManager();
  await window.firebaseManager.initFirebase();
  window.firebaseManager.setProfileManager(window.profileManager);

  console.log("プロフィール画面が初期化されました");
});
