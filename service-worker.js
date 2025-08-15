// service-worker.js
// SpeakerDeck to Google Slides - Service Worker
// Google Slides API連携を処理

console.log('[Service Worker] Loaded');

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Service Worker] Received message:', request.action);
  
  if (request.action === 'CONVERT_TO_GOOGLE_SLIDES') {
    handleGoogleSlidesConversion(request.data)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 非同期レスポンスのため
  }
});

// Google Slides API処理
async function handleGoogleSlidesConversion(data) {
  console.log('[Service Worker] Starting conversion for:', data.presentationTitle);
  console.log('[Service Worker] Slides to convert:', data.slideCount);
  
  try {
    // 1. OAuth認証
    const token = await getAuthToken();
    console.log('[Service Worker] Authentication successful');
    
    // 2. 新しいプレゼンテーション作成
    const presentation = await createPresentation(token, data);
    console.log('[Service Worker] Created presentation:', presentation.presentationId);
    
    // 3. スライドを追加（バッチ処理）
    await addSlides(token, presentation.presentationId, data.slides);
    console.log('[Service Worker] All slides added successfully');
    
    const presentationUrl = `https://docs.google.com/presentation/d/${presentation.presentationId}/edit`;
    console.log('[Service Worker] Presentation URL:', presentationUrl);
    
    return {
      presentationId: presentation.presentationId,
      presentationUrl: presentationUrl
    };
  } catch (error) {
    console.error('[Service Worker] Conversion failed:', error);
    throw error;
  }
}

// OAuth認証
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}

// プレゼンテーション作成
async function createPresentation(token, data) {
  const body = {
    title: data.presentationTitle || 'Untitled Presentation'
  };
  
  // 説明文があれば追加
  if (data.description) {
    body.notes = data.description;
  }
  
  const response = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create presentation: ${error}`);
  }
  
  return await response.json();
}

// 複数スライドを効率的に追加
async function addSlides(token, presentationId, slides) {
  // バッチリクエストを作成
  const requests = [];
  
  // 最初のスライド（タイトルスライド）は既に存在するので、2枚目から追加
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const slideId = `slide_${slide.slideNumber}`;
    
    if (i === 0) {
      // 最初のスライドは既存のものを使用し、画像のみ追加
      requests.push({
        createImage: {
          url: slide.imageUrl,
          elementProperties: {
            pageObjectId: 'p', // デフォルトの最初のスライドID
            size: {
              width: { magnitude: 9144000, unit: 'EMU' },  // フルサイズ
              height: { magnitude: 5143500, unit: 'EMU' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 0,
              translateY: 0,
              unit: 'EMU'
            }
          }
        }
      });
    } else {
      // 新しいスライドを作成
      requests.push({
        createSlide: {
          objectId: slideId,
          insertionIndex: i,
          slideLayoutReference: {
            predefinedLayout: 'BLANK'
          }
        }
      });
      
      // 画像を追加
      requests.push({
        createImage: {
          url: slide.imageUrl,
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: 9144000, unit: 'EMU' },
              height: { magnitude: 5143500, unit: 'EMU' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 0,
              translateY: 0,
              unit: 'EMU'
            }
          }
        }
      });
    }
    
    // スピーカーノートにテキストを追加（テキストがある場合）
    if (slide.text && slide.text !== 'None' && slide.text.trim()) {
      const noteId = i === 0 ? 'p.notes' : `${slideId}.notes`;
      requests.push({
        insertText: {
          objectId: noteId,
          text: slide.text,
          insertionIndex: 0
        }
      });
    }
  }
  
  // バッチリクエストを送信
  if (requests.length > 0) {
    const response = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests })
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to add slides: ${error}`);
    }
    
    return await response.json();
  }
}

// エラーハンドリング用のヘルパー
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Service Worker] Extension installed/updated');
});

// デバッグ用：拡張機能アイコンクリック時の動作
// 注：content scriptでボタンを表示するため、アイコンクリックは現在使用していません
if (chrome.action) {
  chrome.action.onClicked.addListener((tab) => {
    console.log('[Service Worker] Extension icon clicked');
    // 必要に応じて設定ページを開くなど
  });
}