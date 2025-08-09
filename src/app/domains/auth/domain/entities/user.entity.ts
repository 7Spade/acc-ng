import { BaseAggregateRoot } from '@shared';

import { UserCreatedEvent } from '../events/user-created.event';
import { Email } from '../value-objects/email.vo';
import { UserId } from '../value-objects/user-id.vo';
import { UserProfile } from '../value-objects/user-profile.vo';

// 定義 FirebaseUser 的結構
interface FirebaseUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string;
}

/**
 * 用戶實體
 * 封裝用戶的核心業務邏輯和規則
 */
export class User extends BaseAggregateRoot<UserId> {
  private constructor(
    id: UserId,
    private _email: Email,
    private _profile: UserProfile,
    private _firebaseUid?: string,
    private _isAdmin = false
  ) {
    super(id);
  }

  /**
   * 創建新用戶
   */
  static create(email: Email, profile: UserProfile, firebaseUid?: string, isAdmin = false): User {
    const user = new User(UserId.generate(), email, profile, firebaseUid, isAdmin);

    user.addDomainEvent(new UserCreatedEvent(user.id, email, profile));
    return user;
  }

  /**
   * 創建管理員用戶
   */
  static createAdmin(email: Email, profile: UserProfile): User {
    return User.create(email, profile, undefined, true);
  }

  /**
   * 從 Firebase 用戶創建
   */
  static fromFirebaseUser(firebaseUser: FirebaseUser): User {
    const email = Email.create(firebaseUser.email || '');
    const profile = UserProfile.create(firebaseUser.displayName || 'Unknown', firebaseUser.displayName || 'Unknown');

    return User.create(email, profile, firebaseUser.uid);
  }

  /**
   * 從匿名 Firebase 用戶創建
   */
  static fromAnonymousUser(firebaseUser: FirebaseUser): User {
    // 匿名用戶不需要 email，直接創建用戶
    const profile = UserProfile.create('Anonymous', 'User');
    const user = new User(UserId.create(firebaseUser.uid), null as any, profile, firebaseUser.uid, false);

    return user;
  }

  /**
   * 創建匿名用戶
   */
  static createAnonymous(firebaseUid: string): User {
    const profile = UserProfile.create('Anonymous', 'User');
    return new User(UserId.create(firebaseUid), null as any, profile, firebaseUid, false);
  }

  // Getters
  get email(): Email {
    return this._email;
  }

  get profile(): UserProfile {
    return this._profile;
  }

  get firebaseUid(): string | undefined {
    return this._firebaseUid;
  }

  get isAdmin(): boolean {
    return this._isAdmin;
  }

  /**
   * 更新用戶資料
   */
  updateProfile(newProfile: UserProfile): void {
    this._profile = newProfile;
  }

  /**
   * 更新郵箱
   */
  changeEmail(newEmail: Email): void {
    if (!this._email.equals(newEmail)) {
      this._email = newEmail;
    }
  }

  /**
   * 設置為管理員
   */
  promoteToAdmin(): void {
    this._isAdmin = true;
  }

  /**
   * 轉換為 @delon/auth 格式
   */
  toDelonAuthUser(): any {
    return {
      token: this.generateToken(),
      name: this._profile.displayName,
      email: this._email ? this._email.value : null,
      id: this.id.value,
      uid: this._firebaseUid,
      isAdmin: this._isAdmin,
      isAnonymous: !this._email,
      time: +new Date(),
      expired: +new Date() + 1000 * 60 * 60 * 24 // 24小時過期
    };
  }

  /**
   * 轉換為 Firebase 用戶格式
   */
  toFirebaseUser(): FirebaseUser {
    return {
      uid: this.id.value,
      email: this.email.value,
      displayName: this.profile.displayName
    };
  }

  /**
   * 生成認證 token
   */
  private generateToken(): string {
    const prefix = this._isAdmin ? 'admin' : 'user';
    const timestamp = Date.now();
    return `${prefix}-${this.id.value}-${timestamp}`;
  }
}