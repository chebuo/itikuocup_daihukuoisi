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

        console.log("取得したFirestoreデータ:", data);

        // actionsフィールドを確認（新しいオブジェクト形式に対応）
        if (data.actions && Array.isArray(data.actions)) {
          data.actions.forEach((actionGroup, groupIndex) => {
            // オブジェクト形式の場合（新しい形式）
            if (
              typeof actionGroup === "object" &&
              actionGroup !== null &&
              actionGroup.actions
            ) {
              if (Array.isArray(actionGroup.actions)) {
                actionGroup.actions.forEach((action, actionIndex) => {
                  todos.push({
                    id: `group-${groupIndex}-action-${actionIndex}`,
                    title: action,
                    priority: "通常",
                    category: `グループ${groupIndex + 1}`,
                    createdAt: actionGroup.timestamp || new Date(),
                    groupIndex: groupIndex,
                    actionIndex: actionIndex,
                    originalGroup: actionGroup.actions,
                  });
                });
              }
            }
            // 配列形式の場合（従来の形式）
            else if (Array.isArray(actionGroup)) {
              actionGroup.forEach((action, actionIndex) => {
                todos.push({
                  id: `group-${groupIndex}-action-${actionIndex}`,
                  title: action,
                  priority: "通常",
                  category: `グループ${groupIndex + 1}`,
                  createdAt: new Date(),
                  groupIndex: groupIndex,
                  actionIndex: actionIndex,
                  originalGroup: actionGroup,
                });
              });
            }
            // 文字列の場合
            else if (typeof actionGroup === "string") {
              todos.push({
                id: `single-${groupIndex}`,
                title: actionGroup,
                priority: "通常",
                category: "単体アクション",
                createdAt: new Date(),
                groupIndex: groupIndex,
              });
            }
          });
        }

        // 他のフィールドもチェック（従来のTodo形式用）
        Object.keys(data).forEach((key) => {
          if (key !== "actions") {
            const item = data[key];
            if (typeof item === "object" && item !== null) {
              if (item.title || item.text || item.task || item.description) {
                todos.push({
                  id: key,
                  title:
                    item.title || item.text || item.task || item.description,
                  priority: item.priority || "通常",
                  category: item.category || "その他",
                  createdAt:
                    item.createdAt ||
                    item.created ||
                    item.timestamp ||
                    new Date(),
                  ...item,
                });
              }
            }
          }
        });

        console.log(`取得したTodos: ${todos.length}件`, todos);
        return todos;
      } else {
        console.log("Todoドキュメントが存在しません");
        return []; // エラーを投げずに空の配列を返す
      }
    } catch (error) {
      console.error("Todoデータの取得エラー:", error);
      throw new Error(`Todoデータの取得に失敗しました: ${error.message}`);
    }
  }

  createAnalysisPrompt(todos) {
    // グループ別に整理
    const groupedTodos = {};
    const singleTodos = [];

    todos.forEach((todo) => {
      if (todo.groupIndex !== undefined) {
        if (!groupedTodos[todo.groupIndex]) {
          groupedTodos[todo.groupIndex] = [];
        }
        groupedTodos[todo.groupIndex].push(todo);
      } else {
        singleTodos.push(todo);
      }
    });

    let todoText = "";

    // グループ別に表示
    Object.keys(groupedTodos).forEach((groupIndex) => {
      todoText += `\n【セッション${parseInt(groupIndex) + 1}】\n`;
      groupedTodos[groupIndex].forEach((todo) => {
        const createdAt = todo.createdAt
          ? todo.createdAt.toDate
            ? todo.createdAt.toDate().toLocaleDateString("ja-JP")
            : new Date(todo.createdAt).toLocaleDateString("ja-JP")
          : "日付不明";
        todoText += `  - ${todo.title} [${status}] [作成日: ${createdAt}]\n`;
      });
    });

    // 単体のTodoがある場合
    if (singleTodos.length > 0) {
      todoText += `\n【その他のタスク】\n`;
      singleTodos.forEach((todo) => {
        const priority = todo.priority || "通常";
        const category = todo.category || "その他";
        const createdAt = todo.createdAt
          ? todo.createdAt.toDate
            ? todo.createdAt.toDate().toLocaleDateString("ja-JP")
            : new Date(todo.createdAt).toLocaleDateString("ja-JP")
          : "日付不明";

        todoText += `  - ${todo.title} [${status}] [優先度: ${priority}] [カテゴリ: ${category}] [作成日: ${createdAt}]\n`;
      });
    }

    return `以下のアクションリストを分析して、ユーザーの行動パターン、傾向、改善点を日本語で教えてください。また、はい、わかりました、などの返答は不要です。親しみやすく、具体的で実行可能なアドバイスをお願いします。
    加えてこれらのリストはユーザーが実行した物のみを含み、未実行のタスクは含まれていません。

アクションリスト:
${todoText}

分析の観点:
1. セッションごとの特徴や傾向
2. 行動の多様性や偏り
3. 継続性のあるアクション
4. 改善提案とモチベーション向上のアドバイス`;
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

  displayResults(analysisText) {
    const analysisTextElement = document.getElementById("analysisText");
    const lastUpdatedElement = document.getElementById("lastUpdated");

    // Markdown形式のテキストをHTMLに変換して表示
    const formattedHTML = this.convertMarkdownToHTML(analysisText);
    analysisTextElement.innerHTML = formattedHTML;

    lastUpdatedElement.textContent = new Date().toLocaleString("ja-JP");

    this.showResults();
  }

  convertMarkdownToHTML(text) {
    // 簡単なMarkdown -> HTML変換
    let html = text;

    // 見出し変換
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // 太字変換
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // 箇条書き変換（- で始まる行）
    html = html.replace(/^- (.+)$/gm, "<li>$1</li>");

    // リスト要素をulタグで囲む
    html = html.replace(/(<li>.*<\/li>\s*)+/gs, "<ul>$&</ul>");

    // 番号付きリスト変換（数字. で始まる行）
    html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

    // 連続するliタグをolタグで囲む（番号付きリスト用）
    html = html.replace(/^(\d+\. .+$\n?)+/gm, (match) => {
      const items = match.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
      return "<ol>" + items + "</ol>";
    });

    // 改行を<br>に変換（ただし、既にHTMLタグで囲まれている部分は除く）
    html = html.replace(/\n(?![<\/])/g, "<br>");

    // 余分なbrタグを削除
    html = html.replace(/<br>\s*<\/h[1-6]>/g, "</h3>");
    html = html.replace(/<br>\s*<\/li>/g, "</li>");
    html = html.replace(/<br>\s*<\/(ul|ol)>/g, "</$1>");
    html = html.replace(/<(ul|ol)>\s*<br>/g, "<$1>");

    return html;
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
