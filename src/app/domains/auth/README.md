# 🔐 Firebase Auth 與 @delon/auth 整合方案

## 📋 概述

本方案實現了 Firebase Authentication 與 @delon/auth 的無縫整合，提供多種認證方式，同時保持與現有系統的完全兼容性。

## 🏗️ 架構設計

### 核心原則
- **保持 @delon/auth 作為主要認證管理器** - 確保與現有系統的兼容性
- **使用 Firebase Auth 作為認證提供者** - 提供真實的用戶認證服務
- **橋接服務模式** - 將 Firebase Auth 結果轉換為 @delon/auth 格式
- **漸進式遷移** - 支援現有管理員帳號，同時添加 Firebase 認證

### 架構層次

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │           EnhancedLoginComponent                        ││
│  │  • 郵箱密碼登入  • Google 登入  • 管理員快速登入          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              AuthBridgeService                          ││
│  │  • Firebase Auth ↔ @delon/auth 轉換                    ││
│  │  • 統一認證介面                                          ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                LoginUseCase                             ││
│  │  • 登入業務邏輯協調                                       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │           FirebaseAuthInterceptor                       ││
│  │  • 攔截 /login/account 請求                             ││
│  │  • 使用 Firebase Auth 處理認證                          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 User Entity                             ││
│  │  • 用戶業務邏輯  • Firebase ↔ @delon 轉換               ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │            Value Objects                                ││
│  │  • UserId  • Email  • UserProfile                      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 🚀 使用方式

### 1. 管理員登入（向後兼容）

```typescript
// 在登入頁面使用
email: 'admin@company.com'
password: '123456'
```

這組帳號密碼在開發和生產環境都可以使用，無需額外配置。

### 2. Firebase 郵箱登入

```typescript
// 用戶需要先在 Firebase Console 中創建帳號
email: 'user@example.com'
password: 'userPassword'
```

### 3. Google 登入

點擊 "Sign in with Google" 按鈕，使用 Google 帳號登入。

## 🔧 配置說明

### Firebase 配置

Firebase 配置已在 `app.config.ts` 中完成：

```typescript
provideFirebaseApp(() => initializeApp({
  projectId: "ng-acc",
  appId: "1:289956121604:web:4dd9d608a2db962aeaf951",
  // ... 其他配置
})),
provideAuth(() => getAuth()),
```

### 環境配置

#### 開發環境 (`environment.ts`)
```typescript
export const environment = {
  production: false,
  // ... 其他配置
  providers: [provideMockConfig({ data: MOCKDATA })],
  interceptorFns: [mockInterceptor]
};
```

#### 生產環境 (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  // ... 其他配置
  interceptorFns: [firebaseAuthInterceptor]
};
```

## 📱 組件使用

### 替換現有登入組件

```typescript
// 在路由配置中
{
  path: 'login',
  component: EnhancedLoginComponent // 替換原有的 UserLoginComponent
}
```

### 在其他組件中使用認證服務

```typescript
import { AuthBridgeService } from '@app/domains/auth/application/services/auth-bridge.service';

@Component({...})
export class MyComponent {
  private authBridge = inject(AuthBridgeService);

  // 獲取當前用戶
  getCurrentUser() {
    return this.authBridge.getCurrentUser();
  }

  // 監聽認證狀態
  ngOnInit() {
    this.authBridge.authState$.subscribe(user => {
      console.log('User state changed:', user);
    });
  }

  // 登出
  logout() {
    this.authBridge.signOut().subscribe(() => {
      console.log('Logged out');
    });
  }
}
```

## 🔄 遷移指南

### 從 Mock 認證遷移

1. **保持現有功能**：管理員帳號 `admin@company.com/123456` 繼續可用
2. **添加 Firebase 用戶**：在 Firebase Console 中創建新用戶
3. **漸進式替換**：逐步將登入頁面替換為 `EnhancedLoginComponent`

### 遷移步驟

1. **更新路由配置**
```typescript
// routes.ts
{
  path: 'login',
  component: EnhancedLoginComponent
}
```

2. **更新環境配置**（已完成）
3. **測試認證功能**
4. **部署到生產環境**

## 🛡️ 安全考慮

### Token 管理
- Firebase ID Token 自動管理過期時間
- @delon/auth Token 設置 24 小時過期
- 支援自動刷新機制

### 管理員帳號安全
```typescript
// 建議在生產環境中修改管理員密碼
const DEFAULT_AUTH_CONFIG = {
  adminEmail: 'admin@yourcompany.com',
  adminPassword: 'your-secure-password'
};
```

## 🧪 測試

### 單元測試範例

```typescript
describe('AuthBridgeService', () => {
  let service: AuthBridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthBridgeService]
    });
    service = TestBed.inject(AuthBridgeService);
  });

  it('should handle admin login', async () => {
    const result = await service.signInWithEmailPassword(
      'admin@company.com', 
      '123456'
    ).toPromise();
    
    expect(result.msg).toBe('ok');
    expect(result.user.isAdmin).toBe(true);
  });
});
```

## 📊 監控和日誌

### 認證事件監控

```typescript
// 在 AuthBridgeService 中添加日誌
signInWithEmailPassword(email: string, password: string) {
  console.log('Login attempt:', { email, timestamp: new Date() });
  
  return from(signInWithEmailAndPassword(this.firebaseAuth, email, password)).pipe(
    tap(result => {
      console.log('Login success:', { email, uid: result.user.uid });
    }),
    catchError(error => {
      console.error('Login failed:', { email, error: error.message });
      throw error;
    })
  );
}
```

## 🔮 未來擴展

### 計劃功能
1. **多因素認證 (MFA)**
2. **社交登入擴展**（Facebook, GitHub 等）
3. **企業 SSO 整合**
4. **用戶角色管理**
5. **認證審計日誌**

### 擴展範例

```typescript
// 添加 Facebook 登入
signInWithFacebook(): Observable<any> {
  const provider = new FacebookAuthProvider();
  return from(signInWithPopup(this.firebaseAuth, provider)).pipe(
    map(credential => {
      const user = User.fromFirebaseUser(credential.user);
      return this.setDelonAuthToken(user);
    })
  );
}
```

## 🆘 故障排除

### 常見問題

1. **Firebase 配置錯誤**
   - 檢查 `app.config.ts` 中的 Firebase 配置
   - 確認 Firebase 專案設定正確

2. **Google 登入失敗**
   - 檢查 Firebase Console 中的 Google 登入設定
   - 確認授權域名配置

3. **管理員帳號無法登入**
   - 檢查 `AuthBridgeService` 中的管理員帳號配置
   - 確認攔截器正確配置

### 調試技巧

```typescript
// 啟用詳細日誌
localStorage.setItem('debug', 'auth:*');

// 檢查 @delon/auth token
console.log('Current token:', this.tokenService.get());

// 檢查 Firebase 用戶狀態
this.firebaseAuth.onAuthStateChanged(user => {
  console.log('Firebase user:', user);
});
```

## 📚 相關文檔

- [Firebase Authentication 文檔](https://firebase.google.com/docs/auth)
- [@delon/auth 文檔](https://ng-alain.com/auth)
- [AngularFire 文檔](https://github.com/angular/angularfire)
- [專案 DDD 架構指南](../../../docs/DDD_DEVELOPMENT_STANDARDS.md)

---

**版本**: 1.0.0  
**最後更新**: 2024年12月  
**維護者**: NG-AC Development Team