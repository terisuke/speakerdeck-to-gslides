console.log('[SpeakerDeck2GSlides] Extension loaded');

// デバッグ用ヘルパー関数
function debugLog(message, data = null) {
  console.log(`[SpeakerDeck2GSlides] ${message}`, data);
}

function debugError(message, error = null) {
  console.error(`[SpeakerDeck2GSlides] ERROR: ${message}`, error);
}

// 要素が現れるまで待つユーティリティ関数
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found`));
    }, timeout);
  });
}

// プレゼンテーションのタイトルを取得
function getPresentationTitle() {
  try {
    // 複数のセレクタを試す（防御的プログラミング）
    const selectors = [
      'h1.mb-2',
      'h1',
      '[data-testid="presentation-title"]',
      '.presentation-title'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element?.innerText) {
        debugLog('Presentation title found', element.innerText);
        return element.innerText.trim();
      }
    }
    
    debugLog('Presentation title not found, using default');
    return 'Untitled Presentation';
  } catch (error) {
    debugError('Failed to get presentation title', error);
    return 'Untitled Presentation';
  }
}

// メインプレゼンテーションコンテナを検出する関数
function getMainPresentationContainer() {
  const containerSelectors = [
    '.speakerdeck-embed',
    '#talk-embed',
    '[data-testid="presentation-container"]',
    '.presentation-container',
    'main [role="presentation"]',
    '.slides-container',
    '#slides'
  ];
  
  for (const selector of containerSelectors) {
    const container = document.querySelector(selector);
    if (container) {
      // コンテナ内にスライド画像があるか確認
      const hasSlides = container.querySelector('img[src*="slide"]');
      if (hasSlides) {
        debugLog(`Main container found: ${selector}`);
        return container;
      }
    }
  }
  
  // フォールバック: iframeをチェック
  const iframe = document.querySelector('iframe.speakerdeck-iframe, iframe[src*="speakerdeck"]');
  if (iframe) {
    debugLog('SpeakerDeck iframe detected - may need alternative approach');
    return null;
  }
  
  debugLog('Main container not found, using document');
  return document;
}

// 有効なスライド画像かチェックする関数
function isValidSlideImage(element) {
  const src = element.src || '';
  
  // プレビューやサムネイルを除外
  if (src.includes('preview_slide_0') || 
      src.includes('preview') || 
      src.includes('thumb') ||
      src.includes('thumbnail')) {
    return false;
  }
  
  // slide_番号.jpg形式をチェック
  if (src.match(/slide_\d+\.(jpg|jpeg|png|webp)/i)) {
    return true;
  }
  
  // サイズでフィルタ（小さすぎる画像を除外）
  if (element.naturalWidth > 0 && element.naturalHeight > 0) {
    if (element.naturalWidth < 200 || element.naturalHeight < 150) {
      return false;
    }
  }
  
  // presentations/*/slide_* パターンをチェック
  if (src.includes('/presentations/') && src.includes('/slide_')) {
    return true;
  }
  
  return false;
}

// スライド要素のリストを取得（修正版）
function getSlideElements() {
  try {
    // まずメインコンテナを特定
    const mainContainer = getMainPresentationContainer();
    
    // プライマリセレクタ: 正しいスライド画像を直接選択
    const primarySelectors = [
      'img[src*="/slide_"]:not([src*="preview"])',
      'img[src*="/presentations/"][src*="/slide_"]:not([src*="preview"])',
      '.slide img[src*="slide_"]',
      '[data-slide] img[src*="slide_"]'
    ];
    
    for (const selector of primarySelectors) {
      const elements = mainContainer 
        ? mainContainer.querySelectorAll(selector)
        : document.querySelectorAll(selector);
      
      // 追加フィルタ: 正しいスライドのみを抽出
      const validSlides = Array.from(elements).filter(isValidSlideImage);
      
      if (validSlides.length > 0) {
        debugLog(`Found ${validSlides.length} valid slides using selector: ${selector}`);
        
        // 連番チェック: slide_1, slide_2... の順序になっているか確認
        const slideNumbers = validSlides.map(img => {
          const match = img.src.match(/slide_(\d+)\./i);
          return match ? parseInt(match[1]) : -1;
        }).filter(n => n > 0);
        
        if (slideNumbers.length > 0) {
          debugLog(`Slide numbers detected: ${slideNumbers.slice(0, 5).join(', ')}...`);
        }
        
        return validSlides;
      }
    }
    
    // セカンダリセレクタ: 親要素を返す場合
    const secondarySelectors = [
      '[data-slide]',
      '.speakerdeck-slide',
      '.sd-player-slide'
    ];
    
    for (const selector of secondarySelectors) {
      const elements = mainContainer
        ? mainContainer.querySelectorAll(selector)
        : document.querySelectorAll(selector);
      
      if (elements.length > 0) {
        // 各要素内の画像をチェック
        const validElements = [];
        elements.forEach(element => {
          const img = element.querySelector('img');
          if (img && isValidSlideImage(img)) {
            validElements.push(element);
          }
        });
        
        if (validElements.length > 0) {
          debugLog(`Found ${validElements.length} valid slide containers using selector: ${selector}`);
          return validElements;
        }
      }
    }
    
    debugLog('No valid slide elements found');
    return [];
  } catch (error) {
    debugError('Failed to get slide elements', error);
    return [];
  }
}

// スライド内の画像URLを取得
function getSlideImage(slideElement, index) {
  try {
    // 画像要素を探す
    const img = slideElement.querySelector('img') || 
                (slideElement.tagName === 'IMG' ? slideElement : null);
    
    if (img?.src) {
      debugLog(`Slide ${index + 1} image URL:`, img.src);
      return img.src;
    }
    
    // 背景画像をチェック
    const bgImage = slideElement.style.backgroundImage;
    if (bgImage && bgImage.includes('url')) {
      const url = bgImage.match(/url\(['"]?(.*?)['"]?\)/)?.[1];
      if (url) {
        debugLog(`Slide ${index + 1} background image URL:`, url);
        return url;
      }
    }
    
    debugLog(`No image found for slide ${index + 1}`);
    return null;
  } catch (error) {
    debugError(`Failed to get image for slide ${index + 1}`, error);
    return null;
  }
}

// スライド内のハイパーリンクを検出
function getSlideLinks(slideElement, index) {
  try {
    const links = [];
    const linkElements = slideElement.querySelectorAll('a[href]');
    
    linkElements.forEach((link, linkIndex) => {
      const rect = link.getBoundingClientRect();
      const slideRect = slideElement.getBoundingClientRect();
      
      // スライドコンテナに対する相対座標を計算
      const relativeX = rect.left - slideRect.left;
      const relativeY = rect.top - slideRect.top;
      
      const linkData = {
        url: link.href,
        text: link.innerText || link.title || '',
        x: relativeX,
        y: relativeY,
        width: rect.width,
        height: rect.height
      };
      
      links.push(linkData);
      debugLog(`Slide ${index + 1} link ${linkIndex + 1}:`, linkData);
    });
    
    return links;
  } catch (error) {
    debugError(`Failed to get links for slide ${index + 1}`, error);
    return [];
  }
}

// Transcriptが動的に読み込まれるのを待つ関数
async function waitForTranscript(timeout = 10000) {
  debugLog('Waiting for transcript section...');
  
  return new Promise((resolve) => {
    const checkTranscript = () => {
      const transcript = document.getElementById('transcript');
      if (transcript && transcript.querySelector('a[href*="slide_"]')) {
        debugLog('Transcript found!');
        resolve(transcript);
        return true;
      }
      return false;
    };
    
    // 初回チェック
    if (checkTranscript()) return;
    
    // MutationObserverで監視
    const observer = new MutationObserver(() => {
      if (checkTranscript()) {
        observer.disconnect();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // タイムアウト処理
    setTimeout(() => {
      observer.disconnect();
      debugLog('Transcript wait timeout');
      resolve(null);
    }, timeout);
  });
}

// 文字化けを修正する関数
function cleanText(text) {
  if (!text) return '';
  
  // Unicode制御文字を除去
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // 制御文字を空白に
    .replace(/\s+/g, ' ') // 連続する空白を1つに
    .trim();
}

// Transcriptセクションからデータを抽出（新実装）
async function extractFromTranscript() {
  debugLog('Starting transcript-based extraction...');
  
  // 動的読み込みを待つ
  const transcript = await waitForTranscript();
  if (!transcript) {
    debugLog('Transcript section not found after waiting, trying alternative methods...');
    return null;
  }
  
  const slides = [];
  const slideLinks = transcript.querySelectorAll('a[href*="slide_"]');
  
  if (slideLinks.length === 0) {
    debugLog('No slide links found in transcript');
    return null;
  }
  
  slideLinks.forEach((link, index) => {
    const imageUrl = link.href;
    
    // preview_slide_0.jpgを除外
    if (imageUrl.includes('preview_slide_0')) {
      return;
    }
    
    // スライド番号を抽出
    const slideNumberMatch = imageUrl.match(/slide_(\d+)\./i);
    const slideNumber = slideNumberMatch ? parseInt(slideNumberMatch[1]) + 1 : index + 1;
    
    // テキスト内容を取得（文字化け対策）
    const slideContainer = link.closest('li') || link.parentElement;
    const rawText = slideContainer?.textContent || '';
    const slideText = cleanText(rawText);
    const slideTitle = cleanText(link.textContent) || `Slide ${slideNumber}`;
    
    slides.push({
      slideNumber: slideNumber,
      imageUrl: imageUrl,
      title: slideTitle,
      text: slideText.substring(0, 500), // 最初の500文字
      links: [] // ハイパーリンクは取得不可
    });
  });
  
  debugLog(`Found ${slides.length} slides from transcript`);
  return slides;
}

// メタタグからフォールバック抽出（改善版）
function extractFromMetaTags() {
  debugLog('Using fallback: meta tags extraction');
  
  const ogImage = document.querySelector('meta[property="og:image"]')?.content;
  if (!ogImage || !ogImage.includes('slide_')) {
    debugLog('No valid og:image found for fallback');
    return null;
  }
  
  // slide_0.jpgのURLパターンから他のスライドURLを推測
  const baseUrl = ogImage.replace(/slide_\d+\.jpg.*$/, '');
  const slides = [];
  
  // スライド数を推定（デフォルトは20枚）
  let estimatedCount = 20;
  
  // ページ内のヒントから推定
  const slideCountElement = document.querySelector('.slide-count, [data-slide-count]');
  if (slideCountElement) {
    const match = slideCountElement.textContent.match(/\d+/);
    if (match) {
      estimatedCount = parseInt(match[0]);
      debugLog(`Estimated slide count from page: ${estimatedCount}`);
    }
  }
  
  // 推定した枚数分のスライドを生成
  for (let i = 0; i < Math.min(estimatedCount, 50); i++) { // 最大50枚まで
    slides.push({
      slideNumber: i + 1,
      imageUrl: `${baseUrl}slide_${i}.jpg`,
      title: `Slide ${i + 1}`,
      text: '',
      links: []
    });
  }
  
  debugLog(`Estimated ${slides.length} slides from meta tags`);
  return slides;
}

// Player iframe URLの取得
function getPlayerUrl() {
  const iframe = document.querySelector('iframe.speakerdeck-iframe');
  if (iframe && iframe.src) {
    const src = iframe.src.startsWith('//') ? `https:${iframe.src}` : iframe.src;
    debugLog('Player iframe URL found:', src);
    return src;
  }
  return null;
}

// プレゼンテーションデータを抽出（メイン関数）
async function extractPresentationData() {
  try {
    debugLog('=== Starting presentation data extraction ===');
    
    // iframeの存在を確認
    const playerUrl = getPlayerUrl();
    if (playerUrl) {
      debugLog('⚠️ SpeakerDeck content is in iframe (cross-origin) - using alternative methods');
    }
    
    // プレゼンテーションタイトルの取得（文字化け対策）
    const titleElement = document.querySelector('h1.mb-4, h1');
    const metaTitle = document.querySelector('meta[property="og:title"]')?.content;
    const title = cleanText(titleElement?.textContent) || cleanText(metaTitle) || 'Untitled Presentation';
    
    // メタデータの取得（文字化け対策）
    const authorElement = document.querySelector('[itemprop="author"], .author');
    const metaAuthor = document.querySelector('meta[property="og:author"]')?.content;
    const author = cleanText(authorElement?.textContent) || cleanText(metaAuthor) || '';
    const description = cleanText(document.querySelector('meta[property="og:description"]')?.content) || '';
    
    // Transcriptからスライドを抽出（awaitを追加）
    let slides = await extractFromTranscript();
    
    // Transcriptがない場合はメタタグから推測
    if (!slides || slides.length === 0) {
      debugLog('Transcript extraction failed, trying meta tags...');
      slides = extractFromMetaTags();
    }
    
    if (!slides || slides.length === 0) {
      debugError('No slides could be extracted from this page');
      return null;
    }
    
    const presentationData = {
      url: window.location.href,
      presentationTitle: title,
      author: author,
      description: description,
      slideCount: slides.length,
      timestamp: new Date().toISOString(),
      slides: slides,
      extractionMethod: slides[0].text ? 'transcript' : 'meta-fallback',
      limitations: {
        hyperlinks: 'Not available due to iframe cross-origin restrictions',
        coordinates: 'Not available'
      }
    };
    
    debugLog('=== Extraction complete ===');
    debugLog('Method used:', presentationData.extractionMethod);
    debugLog('Slides found:', presentationData.slideCount);
    console.log('[SpeakerDeck2GSlides] Extracted data:', JSON.stringify(presentationData, null, 2));
    
    return presentationData;
  } catch (error) {
    debugError('Failed to extract presentation data', error);
    return null;
  }
}

// 変換ボタンを追加
function addConvertButton() {
  try {
    // 既存のボタンをチェック
    if (document.getElementById('sd2gs-convert-btn')) {
      debugLog('Convert button already exists');
      return;
    }
    
    // ボタンを作成
    const button = document.createElement('button');
    button.id = 'sd2gs-convert-btn';
    button.innerText = '📊 Convert to Google Slides';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background-color: #1a73e8;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: background-color 0.3s;
    `;
    
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#1557b0';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#1a73e8';
    });
    
    button.addEventListener('click', async () => {
      debugLog('Convert button clicked');
      button.disabled = true;
      button.innerText = '⏳ Extracting...';
      
      const data = await extractPresentationData();
      
      if (data) {
        // 制約事項をユーザーに通知
        const message = `
          Found: ${data.presentationTitle}
          Slides: ${data.slideCount}
          Method: ${data.extractionMethod}
          
          ⚠️ Note: Hyperlinks cannot be extracted due to technical limitations.
          Continue with image-only conversion?
        `.trim();
        
        if (confirm(message)) {
          button.innerText = '🔄 Converting...';
          debugLog('User confirmed conversion');
          
          // Send to service worker for Google Slides conversion
          chrome.runtime.sendMessage({
            action: 'CONVERT_TO_GOOGLE_SLIDES',
            data: data
          }, (response) => {
            if (response && response.success) {
              button.innerText = '✅ Success!';
              debugLog('Conversion successful:', response);
              
              // Open the created presentation in a new tab
              if (response.presentationUrl) {
                window.open(response.presentationUrl, '_blank');
              }
              
              // Show success message
              alert(`✅ Conversion Complete!\n\nYour presentation has been created in Google Slides.\nPresentation ID: ${response.presentationId}`);
            } else {
              button.innerText = '❌ Failed';
              debugError('Conversion failed:', response?.error);
              alert(`❌ Conversion Failed\n\n${response?.error || 'Unknown error occurred'}\n\nPlease check:\n1. Google Cloud Client ID is configured\n2. You are signed in to Google\n3. Required permissions are granted`);
            }
            
            // Reset button after 3 seconds
            setTimeout(() => {
              button.innerText = '📊 Convert to Google Slides';
              button.disabled = false;
            }, 3000);
          });
        } else {
          button.innerText = '📊 Convert to Google Slides';
          button.disabled = false;
          debugLog('User cancelled conversion');
        }
      } else {
        button.innerText = '❌ Extraction Failed';
        alert('Could not extract slides from this page.\n\nPossible reasons:\n- The presentation may be private\n- The page structure may have changed\n- Try refreshing the page');
        setTimeout(() => {
          button.innerText = '📊 Convert to Google Slides';
          button.disabled = false;
        }, 3000);
      }
    });
    
    document.body.appendChild(button);
    debugLog('Convert button added');
  } catch (error) {
    debugError('Failed to add convert button', error);
  }
}

// DOM構造を分析する関数（新版 - Transcript中心）
function analyzeDOMStructure() {
  debugLog('=== DOM Structure Analysis (Transcript-focused) ===');
  
  // iframeの確認
  const iframe = document.querySelector('iframe.speakerdeck-iframe');
  if (iframe) {
    debugLog('⚠️ iframe detected:', iframe.src);
    debugLog('   → Cross-origin restriction applies - using alternative extraction');
  }
  
  // Transcriptセクションの分析
  const transcript = document.getElementById('transcript');
  if (transcript) {
    debugLog('✅ Transcript section found');
    const slideLinks = transcript.querySelectorAll('a[href*="slide_"]');
    debugLog(`   - Slide links in transcript: ${slideLinks.length}`);
    
    // サンプル出力
    if (slideLinks.length > 0) {
      debugLog('   Sample URLs:');
      Array.from(slideLinks).slice(0, 3).forEach((link, i) => {
        debugLog(`     ${i + 1}. ${link.href}`);
      });
    }
  } else {
    debugLog('❌ Transcript section NOT found');
  }
  
  // メタタグの確認
  const ogImage = document.querySelector('meta[property="og:image"]')?.content;
  if (ogImage) {
    debugLog('✅ Open Graph image found:', ogImage);
  }
  
  // メタデータ
  const title = document.querySelector('meta[property="og:title"]')?.content;
  const author = document.querySelector('meta[property="og:author"]')?.content;
  debugLog('\n=== Metadata ===');
  debugLog('Title:', title || 'Not found');
  debugLog('Author:', author || 'Not found');
  
  // 結論
  debugLog('\n=== Extraction Strategy ===');
  if (transcript && transcript.querySelectorAll('a[href*="slide_"]').length > 0) {
    debugLog('✅ RECOMMENDED: Use Transcript extraction');
  } else if (ogImage) {
    debugLog('⚠️ FALLBACK: Use meta tag estimation');
  } else {
    debugLog('❌ No viable extraction method available');
  }
  
  debugLog('=== End of Analysis ===');
}

// 初期化関数
async function init() {
  debugLog('Initializing SpeakerDeck to Google Slides extension...');
  
  try {
    // URLチェック
    if (!window.location.href.includes('speakerdeck.com')) {
      debugLog('Not on SpeakerDeck, skipping initialization');
      return;
    }
    
    // プレゼンテーションページかチェック
    const isPresentationPage = 
      window.location.pathname.includes('/') && 
      window.location.pathname.split('/').length >= 3;
    
    if (!isPresentationPage) {
      debugLog('Not on a presentation page, skipping initialization');
      return;
    }
    
    // ページが完全に読み込まれるまで少し待つ
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // DOM構造を分析（開発用）
    analyzeDOMStructure();
    
    // 変換ボタンを追加
    addConvertButton();
    
    // 初回データ抽出テスト（開発用）
    if (window.location.search.includes('debug=true')) {
      await extractPresentationData();
    }
    
    debugLog('Initialization complete');
  } catch (error) {
    debugError('Failed to initialize', error);
  }
}

// ページ読み込み完了を待つ
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}