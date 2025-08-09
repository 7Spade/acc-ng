import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  user,
  signInAnonymously
} from '@angular/fire/auth';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { Observable, from, map, of } from 'rxjs';

import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { UserProfile } from '../../domain/value-objects/user-profile.vo';

import { LoginResponse } from '../dto/responses/login.response';

/**
 * @delon/auth Token 模型介面
 */
interface DelonTokenModel {
  token: string;
  name: string;
  email: string;
  id: string;
  uid?: string;
  isAdmin: boolean;
  time: number;
  expired: number;
}

/**
 * 認證橋接服務
 * 整合 Firebase Auth 與 @delon/auth
 */
@Injectable({
  providedIn: 'root'
})
export class AuthBridgeService {
  private readonly firebaseAuth = inject(Auth);
  private readonly delonTokenService = inject(DA_SERVICE_TOKEN);

  /**
   * 使用郵箱密碼登入
   */
  signInWithEmailPassword(email: string, password: string): Observable<LoginResponse> {
    // 檢查是否為管理員帳號
    if (email === 'admin@company.com' && password === '123456') {
      return this.handleAdminLogin();
    }

    // 使用 Firebase Auth
    return from(signInWithEmailAndPassword(this.firebaseAuth, email, password)).pipe(
      map(credential => {
        const firebaseUser = credential.user;
        const user = User.fromFirebaseUser(firebaseUser);
        return this.setDelonAuthToken(user);
      })
    );
  }

  /**
   * 使用 Google 登入
   */
  signInWithGoogle(): Observable<LoginResponse> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.firebaseAuth, provider)).pipe(
      map(credential => {
        const firebaseUser = credential.user;
        const user = User.fromFirebaseUser(firebaseUser);
        return this.setDelonAuthToken(user);
      })
    );
  }

  /**
   * 匿名登入
   */
  signInAnonymously(): Observable<LoginResponse> {
    return from(signInAnonymously(this.firebaseAuth)).pipe(
      map(credential => {
        const firebaseUser = credential.user;
        // 匿名用戶沒有 email，需要特殊處理
        const user = User.fromAnonymousUser(firebaseUser);
        return this.setDelonAuthToken(user);
      })
    );
  }

  /**
   * 登出
   */
  signOut(): Observable<void> {
    return from(signOut(this.firebaseAuth)).pipe(
      map(() => {
        this.delonTokenService.clear();
      })
    );
  }

  /**
   * 監聽認證狀態變化
   */
  get authState$(): Observable<User | null> {
    return user(this.firebaseAuth).pipe(
      map(firebaseUser => {
        if (!firebaseUser) return null;
        return User.fromFirebaseUser(firebaseUser);
      })
    );
  }

  /**
   * 獲取當前用戶
   */
  getCurrentUser(): User | null {
    const delonUser = this.delonTokenService.get();
    if (!delonUser) return null;

    // 如果是管理員帳號
    if (delonUser['email'] === 'admin@company.com') {
      const email = Email.create('admin@company.com');
      const profile = UserProfile.create('Admin', 'User');
      return User.createAdmin(email, profile);
    }

    // 如果是 Firebase 用戶
    if (delonUser['uid']) {
      // 處理匿名用戶（沒有email的情況）
      const userEmail = delonUser['email'];
      if (!userEmail) {
        // 匿名用戶，使用uid作為email
        const email = Email.create(`anonymous-${delonUser['uid']}@anonymous.com`);
        const profile = UserProfile.create('Anonymous', 'User');
        return User.create(email, profile, delonUser['uid']);
      }

      const email = Email.create(userEmail);
      const userName = delonUser['name'] || 'User';
      const nameParts = userName.split(' ');
      const profile = UserProfile.create(nameParts[0] || 'User', nameParts[1] || 'User');
      return User.create(email, profile, delonUser['uid']);
    }

    return null;
  }

  /**
   * 處理管理員登入
   */
  private handleAdminLogin(): Observable<LoginResponse> {
    const email = Email.create('admin@company.com');
    const profile = UserProfile.create('Admin', 'User');
    const adminUser = User.createAdmin(email, profile);

    return of(this.setDelonAuthToken(adminUser));
  }

  /**
   * 設置 @delon/auth token
   */
  private setDelonAuthToken(user: User): LoginResponse {
    const delonUser = user.toDelonAuthUser();
    
    // 創建符合 @delon/auth 要求的 token 物件
    const tokenModel: DelonTokenModel = {
      token: `Bearer-${delonUser.id || 'token'}`,
      name: delonUser.name || 'User',
      email: delonUser.email || '',
      id: delonUser.id || '',
      uid: delonUser.uid,
      isAdmin: delonUser.isAdmin || false,
      time: +new Date(),
      expired: +new Date() + 1000 * 60 * 60 * 24 // 24小時後過期
    };

    this.delonTokenService.set(tokenModel);

    return {
      msg: 'ok',
      user: tokenModel
    };
  }
}
