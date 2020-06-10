---
title: フック
layout: page
---

## オブジェクトのライフサイクル

フックとは生成/参照/更新/削除の前後に呼ばれる関数のことです。

モデルに特定のメソッドを定義すると、生成、更新、参照、削除の時に自動的に呼ばれます。コールバックからエラーを返した場合、GORMはそれ以降の操作を停止して現在のトランザクションをロールバックします。

## フック

### オブジェクトの生成

生成に使えるフック

```go
// トランザクションの開始
BeforeSave
BeforeCreate
// 関連の保存前
// `CreatedAt`と`UpdatedAt`のタイムスタンプ更新
// 自身の保存
// デフォルト値か空値のフィールドの再ロード
// 関連の保存後
AfterCreate
AfterSave
// トランザクションのコミットもしくはロールバック
```

コード例:

```go
func (u *User) BeforeSave() (err error) {
  if !u.IsValid() {
    err = errors.New("不正な値は保存できません")
  }
  return
}

func (u *User) AfterCreate(scope *gorm.Scope) (err error) {
  if u.ID == 1 {
    scope.DB().Model(u).Update("role", "admin")
  }
  return
}
```

**メモ** GORMにおける保存と削除の操作はデフォルトでトランザクション内で実行されます。そのため、トランザクション内での変更はコミットするまで可視化されません。 フック内からこれらの変更にアクセスしたい場合は、現在のトランザクションをフックの引数として受け入れます。例:

```go
func (u *User) AfterCreate(tx *gorm.DB) (err error) {
  tx.Model(u).Update("role", "admin")
  return
}
```

### オブジェクトの更新

更新に使えるフック

```go
// トランザクション開始
BeforeSave
BeforeUpdate
// 関連の保存前
// `UpdatedAt`のタイムスタンプ更新
// 自身の保存
// 関連の保存後
AfterUpdate
AfterSave
// トランザクションのコミットもしくはロールバック
```

コード例:

```go
func (u *User) BeforeUpdate() (err error) {
  if u.readonly() {
    err = errors.New("読み取り専用ユーザーです")
  }
  return
}

// 同一のトランザクション内でデータを更新する
func (u *User) AfterUpdate(tx *gorm.DB) (err error) {
  if u.Confirmed {
    tx.Model(&Address{}).Where("user_id = ?", u.ID).Update("verfied", true)
  }
  return
}
```

### オブジェクトの削除

削除に使えるフック

```go
// トランザクション開始
BeforeDelete
// 自身の削除
AfterDelete
// トランザクションのコミットもしくはロールバック
```

コード例:

```go
// 同一のトランザクション内でデータを更新する
func (u *User) AfterDelete(tx *gorm.DB) (err error) {
  if u.Confirmed {
    tx.Model(&Address{}).Where("user_id = ?", u.ID).Update("invalid", false)
  }
  return
}
```

### オブジェクトの参照

参照に使えるフック

```go
// データベースからのデータロード
// プリロード(eager loading)
AfterFind
```

コード例:

```go
func (u *User) AfterFind() (err error) {
  if u.MemberShip == "" {
    u.MemberShip = "user"
  }
  return
}
```