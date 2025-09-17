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

// Gemini API設定
const GEMINI_API_KEY = "AIzaSyCTGPoJ5zziOKb7YB2u_rd7MZxWACh0mps"; // ここにあなたのGemini APIキーを入力してください
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

class TodoAnalyzer {
  constructor() {
    this.db = firebase.firestore();
    this.auth = firebase.auth();
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const analyzeBtn = document.getElementById("analyzeBtn");
    const retryBtn = document.getElementById("retryBtn");

    analyzeBtn.addEventListener("click", () => this.analyzeTodos());
    retryBtn.addEventListener("click", () => this.analyzeTodos());
  }

  async analyzeTodos() {
    try {
      // UI更新
      this.showLoading();
      this.hideResults();
      this.hideError();

      // 現在のユーザーを取得
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error("ユーザーがログインしていません");
      }

      // Firestoreからtodoデータを取得
      const todos = await this.fetchTodosFromFirestore(currentUser.uid);

      if (todos.length === 0) {
        throw new Error("分析するTodoデータがありません");
      }

      // 統計情報を更新
      this.updateStats(todos);

      // AIに送信するためのプロンプトを作成
      const analysisPrompt = this.createAnalysisPrompt(todos);

      // Gemini APIで分析
      const analysisResult = await this.callGeminiAPI(analysisPrompt);

      // 結果を表示
      this.displayResults(analysisResult);
    } catch (error) {
      console.error("分析エラー:", error);
      this.showError(error.message);
    } finally {
      this.hideLoading();
    }
  }

  async fetchTodosFromFirestore(uid) {
    try {
      const todoRef = this.db.collection("todolist").doc(uid);
      const todoDoc = await todoRef.get();

      if (todoDoc.exists) {
        const data = todoDoc.data();
        const todos = [];

        // ドキュメント内のすべてのフィールドをチェック
        // actions、guest、その他のフィールドがTodoアイテムの可能性
        Object.keys(data).forEach((key) => {
          const item = data[key];

          // オブジェクトで、Todoっぽいプロパティを持つものを抽出
          if (typeof item === "object" && item !== null) {
            // 一般的なTodoプロパティをチェック
            if (item.title || item.text || item.task || item.description) {
              todos.push({
                id: key,
                title: item.title || item.text || item.task || item.description,
                completed: item.completed || item.done || false,
                priority: item.priority || "通常",
                category: item.category || "その他",
                createdAt:
                  item.createdAt ||
                  item.created ||
                  item.timestamp ||
                  new Date(),
                ...item, // 他のプロパティも含める
              });
            }
          }
        });

        return todos;
      } else {
        throw new Error("Todoドキュメントが存在しません");
      }
    } catch (error) {
      throw new Error(`Todoデータの取得に失敗しました: ${error.message}`);
    }
  }

  createAnalysisPrompt(todos) {
    const todoText = todos
      .map((todo) => {
        const status = todo.completed ? "完了" : "未完了";
        const priority = todo.priority || "通常";
        const category = todo.category || "その他";
        const createdAt = todo.createdAt
          ? new Date(todo.createdAt.toDate()).toLocaleDateString("ja-JP")
          : "日付不明";

        return `- ${
          todo.title || todo.text
        } [${status}] [優先度: ${priority}] [カテゴリ: ${category}] [作成日: ${createdAt}]`;
      })
      .join("\n");

    return `以下のTodoリストを分析して、ユーザーのタスク管理の傾向、改善点、おすすめのアクションを日本語で教えてください。

Todoリスト:
${todoText}

分析の観点:
1. タスクの完了率と傾向
2. 優先度の設定状況
3. カテゴリ別の分析
4. 時間管理の状況
5. 改善提案

親しみやすく、具体的で実行可能なアドバイスをお願いします。`;
  }

  async callGeminiAPI(prompt) {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API請求失败: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("APIから有効な回答を取得できませんでした");
      }
    } catch (error) {
      throw new Error(`AI分析に失敗しました: ${error.message}`);
    }
  }

  updateStats(todos) {
    const totalTodos = todos.length;
    const completedTodos = todos.filter((todo) => todo.completed).length;
    const pendingTodos = totalTodos - completedTodos;
    const completionRate =
      totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

    document.getElementById("totalTodos").textContent = totalTodos;
    document.getElementById("completedTodos").textContent = completedTodos;
    document.getElementById("pendingTodos").textContent = pendingTodos;
    document.getElementById(
      "completionRate"
    ).textContent = `${completionRate}%`;

    this.showStats();
  }

  displayResults(analysisText) {
    const analysisTextElement = document.getElementById("analysisText");
    const lastUpdatedElement = document.getElementById("lastUpdated");

    analysisTextElement.textContent = analysisText;
    lastUpdatedElement.textContent = new Date().toLocaleString("ja-JP");

    this.showResults();
  }

  showLoading() {
    document.getElementById("loadingIndicator").classList.remove("hidden");
    document.getElementById("analyzeBtn").disabled = true;
  }

  hideLoading() {
    document.getElementById("loadingIndicator").classList.add("hidden");
    document.getElementById("analyzeBtn").disabled = false;
  }

  showResults() {
    document.getElementById("analysisResults").classList.remove("hidden");
  }

  hideResults() {
    document.getElementById("analysisResults").classList.add("hidden");
  }

  showStats() {
    document.getElementById("todoStats").classList.remove("hidden");
  }

  showError(message) {
    document.getElementById("errorText").textContent = message;
    document.getElementById("errorMessage").classList.remove("hidden");
  }

  hideError() {
    document.getElementById("errorMessage").classList.add("hidden");
  }
}

// ページ読み込み後に初期化
document.addEventListener("DOMContentLoaded", () => {
  // Firebase認証状態の確認
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // ユーザーがログインしている場合、TodoAnalyzerを初期化
      new TodoAnalyzer();
    } else {
      // ログインしていない場合はログインページにリダイレクト
      window.location.href = "public/signin.html";
      console.error("ユーザーがログインしていません");
    }
  });
});
